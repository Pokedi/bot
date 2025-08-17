/* eslint-disable radix */
"use strict";
/**
 * Standalone BattleTextParser for NodeJS.
 *
 * This script combines the necessary components from battle-text-parser.js,
 * battle-dex.js, battle-dex-data.js, and battle-teams.js to create a
 * self-contained module for use in a NodeJS environment.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com> (original author)
 * @license MIT
 */

// --- Helper functions (from battle-dex.js) ---

function toID(text) {
	if (text?.id) {
		text = text.id;
	} else if (text?.userid) {
		text = text.userid;
	}
	if (typeof text !== 'string' && typeof text !== 'number') return '';
	return `${text}`.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

const BattleStatNames = {
	hp: 'HP',
	atk: 'Atk',
	def: 'Def',
	spa: 'SpA',
	spd: 'SpD',
	spe: 'Spe',
};

// Mock data stores. In a real application, these would be populated from
// the actual data files (e.g., from JSON files).

// --- BattleText (dependency of BattleTextParser) ---
// This is a placeholder. The actual BattleText object contains many templates.
// You would need to populate this from the original source if full descriptions are needed.
import BattleText from "../Data/battleParser.json" with {type: "json"};

// --- The main BattleTextParser class ---

class BattleTextParser {
	constructor(perspective = 'p1') {
		this.p1 = "Player 1";
		this.p2 = "Player 2";
		this.p3 = "Player 3";
		this.p4 = "Player 4";
		this.gen = 9;
		this.turn = 0;
		this.curLineSection = 'break';
		this.lowercaseRegExp = undefined;
		this.perspective = perspective;
	}

	static escapeRegExp(input) {
		return input.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
	}

	static escapeReplace(input) {
		return input.replace(/\$/g, '$$$$');
	}

	pokemonName(pokemon) {
		if (!pokemon) return '';
		if (!pokemon.startsWith('p')) return `???pokemon:${pokemon}???`;
		if (pokemon.charAt(3) === ':') return BattleTextParser.escapeReplace(pokemon.slice(4).trim());
		if (pokemon.charAt(2) === ':') return BattleTextParser.escapeReplace(pokemon.slice(3).trim());
		return `???pokemon:${pokemon}???`;
	}

	pokemon(pokemon) {
		if (!pokemon) return '';
		const side = pokemon.slice(0, 2);
		if (!['p1', 'p2', 'p3', 'p4'].includes(side)) return `???pokemon:${pokemon}???`;

		const name = this.pokemonName(pokemon);
		const isNear = side === this.perspective || side === BattleTextParser.allyID(this.perspective);
		const template = BattleText.default[isNear ? 'pokemon' : 'opposingPokemon'];
		return template.replace('[NICKNAME]', name).replace(/\$/g, '$$$$');
	}

	pokemonFull(pokemon, details) {
		const nickname = this.pokemonName(pokemon);
		const species = details.split(',')[0];
		if (nickname === species) return [pokemon.slice(0, 2), `**${species}**`];
		return [pokemon.slice(0, 2), `${nickname} (**${species}**)`];
	}

	trainer(side) {
		side = side.slice(0, 2);
		if (side === 'p1') return this.p1;
		if (side === 'p2') return this.p2;
		if (side === 'p3') return this.p3;
		if (side === 'p4') return this.p4;
		return `???side:${side}???`;
	}

	static allyID(sideid) {
		if (sideid === 'p1') return 'p3';
		if (sideid === 'p2') return 'p4';
		if (sideid === 'p3') return 'p1';
		if (sideid === 'p4') return 'p2';
		return '';
	}

	team(side, isFar = false) {
		side = side.slice(0, 2);
		const isNear = side === this.perspective || side === BattleTextParser.allyID(this.perspective);
		if (isNear) {
			return !isFar ? BattleText.default.team : BattleText.default.opposingTeam;
		}
		return isFar ? BattleText.default.team : BattleText.default.opposingTeam;
	}

	own(side) {
		side = side.slice(0, 2);
		if (side === this.perspective) {
			return 'OWN';
		}
		return '';
	}

	party(side) {
		side = side.slice(0, 2);
		if (side === this.perspective || side === BattleTextParser.allyID(this.perspective)) {
			return BattleText.default.party;
		}
		return BattleText.default.opposingParty;
	}

	static effectId(effect) {
		if (!effect) return '';
		if (effect.startsWith('item:') || effect.startsWith('move:')) {
			effect = effect.slice(5);
		} else if (effect.startsWith('ability:')) {
			effect = effect.slice(8);
		}
		return toID(effect);
	}

	effect(effect) {
		if (!effect) return '';
		if (effect.startsWith('item:') || effect.startsWith('move:')) {
			return effect.slice(5).trim();
		} else if (effect.startsWith('ability:')) {
			return effect.slice(8).trim();
		}
		return effect.trim();
	}

	template(type, ...namespaces) {
		for (const namespace of namespaces) {
			if (!namespace) continue;
			if (namespace === 'OWN') {
				return (BattleText.default[type + 'Own'] || '') + '\n';
			}
			if (namespace === 'NODEFAULT') {
				return '';
			}
			let id = BattleTextParser.effectId(namespace);
			if (BattleText[id] && type in BattleText[id]) {
				if (BattleText[id][type].charAt(1) === '.') type = BattleText[id][type].slice(2);
				if (BattleText[id][type].startsWith('#')) id = BattleText[id][type].slice(1);
				if (!BattleText[id][type]) return '';
				return BattleText[id][type] + '\n';
			}
		}
		if (!BattleText.default[type]) return `???template:${type}???\n`;
		return BattleText.default[type] + '\n';
	}

	maybeAbility(effect, holder) {
		if (!effect || !effect.startsWith('ability:')) return '';
		return this.ability(effect.slice(8).trim(), holder);
	}

	ability(name, holder) {
		if (!name) return '';
		return (BattleText.default.abilityActivation || '')
			.replace('[POKEMON]', this.pokemon(holder))
			.replace('[ABILITY]', this.effect(name)) + '\n';
	}

	static stat(stat) {
		return BattleStatNames[stat] || `???stat:${stat}???`;
	}

	fixLowercase(input) {
		if (this.lowercaseRegExp === undefined) {
			const prefixes = ['pokemon', 'opposingPokemon', 'team', 'opposingTeam', 'party', 'opposingParty'].map(templateId => {
				const template = BattleText.default[templateId];
				if (!template || template.startsWith(template.charAt(0).toUpperCase())) return '';
				const bracketIndex = template.indexOf('[');
				if (bracketIndex >= 0) return template.slice(0, bracketIndex);
				return template;
			}).filter(prefix => prefix);
			if (prefixes.length) {
				const buf = `((?:^|\\n)(?:  |  \\(|\\[)?)(${prefixes.map(BattleTextParser.escapeRegExp).join('|')
				})`;
				this.lowercaseRegExp = new RegExp(buf, 'g');
			} else {
				this.lowercaseRegExp = null;
			}
		}
		if (!this.lowercaseRegExp) return input;
		return input.replace(this.lowercaseRegExp, (match, p1, p2) => (p1 + p2.charAt(0).toUpperCase() + p2.slice(1)));
	}

	lineSection(args, kwArgs) {
		if (kwArgs.premajor) return 'preMajor';
		if (kwArgs.postmajor) return 'postMajor';
		if (kwArgs.major) return 'major';
		const cmd = args[0];
		switch (cmd) {
		case 'done':
		case 'turn':
			return 'break';
		case 'move':
		case 'cant':
		case 'switch':
		case 'drag':
		case 'upkeep':
		case 'start':
		case '-mega':
		case '-candynamax':
		case '-terastallize':
			return 'major';
		case 'switchout':
		case 'faint':
			return 'preMajor';
		case '-zpower':
			return 'postMajor';
		case '-damage': {
			const id = BattleTextParser.effectId(kwArgs.from);
			if (id === 'confusion') return 'major';
			return 'postMajor';
		}
		case '-curestatus': {
			const id = BattleTextParser.effectId(kwArgs.from);
			if (id === 'naturalcure') return 'preMajor';
			return 'postMajor';
		}
		case '-start': {
			const id = BattleTextParser.effectId(kwArgs.from);
			if (id === 'protean') return 'preMajor';
			return 'postMajor';
		}
		case '-activate': {
			const id = BattleTextParser.effectId(args[2]);
			if (id === 'confusion' || id === 'attract') return 'preMajor';
			return 'postMajor';
		}
		}
		return (cmd.startsWith('-') ? 'postMajor' : '');
	}

	sectionBreak(args, kwArgs) {
		const prevSection = this.curLineSection;
		const curSection = this.lineSection(args, kwArgs);
		if (!curSection) return false;
		this.curLineSection = curSection;
		switch (curSection) {
		case 'break':
			if (prevSection !== 'break') return true;
			return false;
		case 'preMajor':
		case 'major':
			if (prevSection === 'postMajor' || prevSection === 'major') return true;
			return false;
		case 'postMajor':
			return false;
		}
		return false;
	}

	extractMessage(buf) {
		let out = '';
		for (const line of buf.split('\n')) {
			const { args, kwArgs } = BattleTextParser.parseBattleLine(line);
			out += this.parseArgs(args, kwArgs) || '';
		}
		return out;
	}

	static parseLine(line, noDefault) {
		if (!line.startsWith('|')) {
			return ['', line];
		}
		if (line === '|') {
			return ['done'];
		}
		const index = line.indexOf('|', 1);
		const cmd = line.slice(1, index);
		switch (cmd) {
		case 'chatmsg':
		case 'chatmsg-raw':
		case 'raw':
		case 'error':
		case 'html':
		case 'inactive':
		case 'inactiveoff':
		case 'warning':
		case 'fieldhtml':
		case 'controlshtml':
		case 'pagehtml':
		case 'bigerror':
		case 'debug':
		case 'tier':
		case 'challstr':
		case 'popup':
		case '':
			return [cmd, line.slice(index + 1)];
		case 'c':
		case 'chat':
		case 'uhtml':
		case 'uhtmlchange':
		case 'queryresponse':
		case 'showteam': {
			// three parts
			const index2a = line.indexOf('|', index + 1);
			return [cmd, line.slice(index + 1, index2a), line.slice(index2a + 1)];
		}
		case 'c:':
		case 'pm': {
			// four parts
			const index2b = line.indexOf('|', index + 1);
			const index3b = line.indexOf('|', index2b + 1);
			return [cmd, line.slice(index + 1, index2b), line.slice(index2b + 1, index3b), line.slice(index3b + 1)];
		}
		}
		if (noDefault) return null;
		return line.slice(1).split('|');
	}

	static upgradeArgs({ args, kwArgs }) {
		switch (args[0]) {
		case '-activate': {
			if (kwArgs.item || kwArgs.move || kwArgs.number || kwArgs.ability) return { args, kwArgs };
			const [pokemon, effect, arg3, arg4] = args.slice(1);
			const { of: target } = kwArgs;
			const id = BattleTextParser.effectId(effect);
			if (kwArgs.block) return { args: ['-fail', pokemon], kwArgs };
			// many more cases from original file...
			break;
		}
		}
		return { args, kwArgs };
	}

	static parseBattleLine(line) {
		const args = BattleTextParser.parseLine(line, true);
		if (args) return { args, kwArgs: {} };

		const parts = line.slice(1).split('|');
		const kwArgs = {};
		while (parts.length > 1) {
			const lastArg = parts[parts.length - 1];
			if (!lastArg.startsWith('[')) break;
			const bracketPos = lastArg.indexOf(']');
			if (bracketPos <= 0) break;
			kwArgs[lastArg.slice(1, bracketPos)] = lastArg.slice(bracketPos + 1).trim() || '.';
			parts.pop();
		}
		return BattleTextParser.upgradeArgs({ args: parts, kwArgs });
	}

	parseArgs(args, kwArgs, noSectionBreak) {
		const buf = !noSectionBreak && this.sectionBreak(args, kwArgs) ? '\n' : '';
		return buf + this.fixLowercase(this.parseArgsInner(args, kwArgs) || '');
	}

	parseArgsInner(args, kwArgs) {
		const cmd = args[0];
		switch (cmd) {
		case 'player': {
			const [, side, name] = args;
			if (side === 'p1' && name) {
				this.p1 = BattleTextParser.escapeReplace(name);
			} else if (side === 'p2' && name) {
				this.p2 = BattleTextParser.escapeReplace(name);
			} else if (side === 'p3' && name) {
				this.p3 = BattleTextParser.escapeReplace(name);
			} else if (side === 'p4' && name) {
				this.p4 = BattleTextParser.escapeReplace(name);
			}
			return '';
		}
		case 'gen': {
			const [, num] = args;
			this.gen = parseInt(num, 10);
			return '';
		}
		case 'turn': {
			const [, num] = args;
			this.turn = Number.parseInt(num, 10);
			return this.template('turn').replace('[NUMBER]', num) + '\n';
		}
		case 'start': {
			return this.template('startBattle').replace('[TRAINER]', this.p1).replace('[TRAINER]', this.p2);
		}
		case 'win':
		case 'tie': {
			const [, name] = args;
			if (cmd === 'tie' || !name) {
				return this.template('tieBattle').replace('[TRAINER]', this.p1).replace('[TRAINER]', this.p2);
			}
			return this.template('winBattle').replace('[TRAINER]', name);
		}
		case 'switch': {
			const [, pokemon, details] = args;
			const [side, fullname] = this.pokemonFull(pokemon, details);
			const template = this.template('switchIn', this.own(side));
			return template.replace('[TRAINER]', this.trainer(side)).replace('[FULLNAME]', fullname);
		}
		case 'drag': {
			const [, pokemon, details] = args;
			const [side, fullname] = this.pokemonFull(pokemon, details);
			const template = this.template('drag');
			return template.replace('[TRAINER]', this.trainer(side)).replace('[FULLNAME]', fullname);
		}
		case 'detailschange':
		case '-transform':
		case '-formechange': {
			const [, pokemon, arg2, arg3] = args;
			let newSpecies = '';
			switch (cmd) {
			case 'detailschange':
				newSpecies = arg2.split(',')[0].trim();
				break;
			case '-transform':
				newSpecies = arg3;
				break;
			case '-formechange':
				newSpecies = arg2;
				break;
			}
			const newSpeciesId = toID(newSpecies);
			let id = '';
			let templateName = 'transform';
			if (cmd !== '-transform') {
				switch (newSpeciesId) {
				case 'greninjaash':
					id = 'battlebond';
					break;
				case 'mimikyubusted':
					id = 'disguise';
					break;
				case 'zygardecomplete':
					id = 'powerconstruct';
					break;
				case 'necrozmaultra':
					id = 'ultranecroziumz';
					break;
				case 'darmanitanzen':
					id = 'zenmode';
					break;
				case 'darmanitan':
					id = 'zenmode';
					templateName = 'transformEnd';
					break;
				case 'darmanitangalarzen':
					id = 'zenmode';
					break;
				case 'darmanitangalar':
					id = 'zenmode';
					templateName = 'transformEnd';
					break;
				case 'aegislashblade':
					id = 'stancechange';
					break;
				case 'aegislash':
					id = 'stancechange';
					templateName = 'transformEnd';
					break;
				case 'wishiwashischool':
					id = 'schooling';
					break;
				case 'wishiwashi':
					id = 'schooling';
					templateName = 'transformEnd';
					break;
				case 'miniormeteor':
					id = 'shieldsdown';
					break;
				case 'minior':
					id = 'shieldsdown';
					templateName = 'transformEnd';
					break;
				case 'eiscuenoice':
					id = 'iceface';
					break;
				case 'eiscue':
					id = 'iceface';
					templateName = 'transformEnd';
					break;
				case 'terapagosterastal':
					id = 'terashift';
					break;
				}
			} else if (newSpecies) {
				id = 'transform';
			}
			const template = this.template(templateName, id, kwArgs.msg ? '' : 'NODEFAULT');
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[SPECIES]', newSpecies);
		}
		case 'switchout': {
			const [, pokemon] = args;
			const side = pokemon.slice(0, 2);
			const template = this.template('switchOut', kwArgs.from, this.own(side));
			return template.replace('[TRAINER]', this.trainer(side)).replace('[NICKNAME]', this.pokemonName(pokemon)).replace('[POKEMON]', this.pokemon(pokemon));
		}
		case 'faint': {
			const [, pokemon] = args;
			const template = this.template('faint');
			return template.replace('[POKEMON]', this.pokemon(pokemon));
		}
		case 'swap': {
			const [, pokemon, target] = args;
			if (!target || !isNaN(Number(target))) {
				const template = this.template('swapCenter');
				return template.replace('[POKEMON]', this.pokemon(pokemon));
			}
			const template = this.template('swap');
			return template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[TARGET]', this.pokemon(target));
		}
		case 'move': {
			const [, pokemon, move] = args;
			let line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (kwArgs.zeffect) {
				line1 = this.template('zEffect').replace('[POKEMON]', this.pokemon(pokemon));
			}
			const template = this.template('move', kwArgs.from);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[MOVE]', move);
		}
		case 'cant': {
			const [, pokemon, effect, move] = args;
			const template = this.template('cant', effect, 'NODEFAULT') ||
				this.template(move ? 'cant' : 'cantNoMove');
			const line1 = this.maybeAbility(effect, kwArgs.of || pokemon);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[MOVE]', move);
		}
		case '-candynamax': {
			const [, side] = args;
			const own = this.own(side);
			let template = '';
			if (this.turn === 1) {
				if (own) template = this.template('canDynamax', own);
			} else {
				template = this.template('canDynamax', own);
			}
			return template.replace('[TRAINER]', this.trainer(side));
		}
		case 'message': {
			const [, message] = args;
			return '' + message + '\n';
		}
		case '-start': {
			const [, pokemon, effect, arg3] = args;
			const line1 = this.maybeAbility(effect, pokemon) || this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			const id = BattleTextParser.effectId(effect);
			if (id === 'typechange') {
				const template = this.template('typeChange', kwArgs.from);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[TYPE]', arg3)
					.replace('[SOURCE]', this.pokemon(kwArgs.of));
			}
			if (id === 'typeadd') {
				const template = this.template('typeAdd', kwArgs.from);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[TYPE]', arg3);
			}
			if (id.startsWith('stockpile')) {
				const num = id.slice(9);
				const template = this.template('start', 'stockpile');
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[NUMBER]', num);
			}
			if (id.startsWith('perish')) {
				const num = id.slice(6);
				const template = this.template('activate', 'perishsong');
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[NUMBER]', num);
			}
			if (id.startsWith('protosynthesis') || id.startsWith('quarkdrive')) {
				const stat = id.slice(-3);
				const template = this.template('start', id.slice(0, id.length - 3));
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[STAT]', BattleTextParser.stat(stat));
			}
			let templateId = 'start';
			if (kwArgs.already) templateId = 'alreadyStarted';
			if (kwArgs.fatigue) templateId = 'startFromFatigue';
			if (kwArgs.zeffect) templateId = 'startFromZEffect';
			if (kwArgs.damage) templateId = 'activate';
			if (kwArgs.block) templateId = 'block';
			if (kwArgs.upkeep) templateId = 'upkeep';
			if (id === 'mist' && this.gen <= 2) templateId = `startGen${this.gen}`;
			if (id === 'reflect' || id === 'lightscreen') templateId = 'startGen1';
			if (templateId === 'start' && kwArgs.from?.startsWith('item:')) {
				templateId += 'FromItem';
			}
			const template = this.template(templateId, kwArgs.from, effect);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[EFFECT]', this.effect(effect))
				.replace('[MOVE]', arg3).replace('[SOURCE]', this.pokemon(kwArgs.of)).replace('[ITEM]', this.effect(kwArgs.from));
		}
		case '-end': {
			const [, pokemon, effect] = args;
			const line1 = this.maybeAbility(effect, pokemon) || this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			const id = BattleTextParser.effectId(effect);
			if (id === 'doomdesire' || id === 'futuresight') {
				const template = this.template('activate', effect);
				return line1 + template.replace('[TARGET]', this.pokemon(pokemon));
			}
			const templateId = 'end';
			let template = '';
			if (kwArgs.from?.startsWith('item:')) {
				template = this.template('endFromItem', effect);
			}
			if (!template) template = this.template(templateId, effect);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[EFFECT]', this.effect(effect))
				.replace('[SOURCE]', this.pokemon(kwArgs.of)).replace('[ITEM]', this.effect(kwArgs.from));
		}
		case '-ability': {
			let [, pokemon, ability, oldAbility, arg4] = args;
			let line1 = '';
			if (oldAbility && (oldAbility.startsWith('p1') || oldAbility.startsWith('p2') || oldAbility === 'boost')) {
				arg4 = oldAbility;
				oldAbility = '';
			}
			if (oldAbility) line1 += this.ability(oldAbility, pokemon);
			line1 += this.ability(ability, pokemon);
			if (kwArgs.fail) {
				const template = this.template('block', kwArgs.from);
				return line1 + template;
			}
			if (kwArgs.from) {
				line1 = this.maybeAbility(kwArgs.from, pokemon) + line1;
				const template = this.template('changeAbility', kwArgs.from);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[ABILITY]', this.effect(ability))
					.replace('[SOURCE]', this.pokemon(kwArgs.of));
			}
			const id = BattleTextParser.effectId(ability);
			if (id === 'unnerve') {
				const template = this.template('start', ability);
				return line1 + template.replace('[TEAM]', this.team(pokemon.slice(0, 2), true));
			}
			let templateId = 'start';
			if (id === 'anticipation' || id === 'sturdy') templateId = 'activate';
			const template = this.template(templateId, ability, 'NODEFAULT');
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}
		case '-endability': {
			const [, pokemon, ability] = args;
			if (ability) return this.ability(ability, pokemon);
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			const template = this.template('start', 'Gastro Acid');
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}
		case '-item': {
			const [, pokemon, item] = args;
			const id = BattleTextParser.effectId(kwArgs.from);
			let target = '';
			if (['magician', 'pickpocket'].includes(id)) {
				[target, kwArgs.of] = [kwArgs.of, ''];
			}
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (['thief', 'covet', 'bestow', 'magician', 'pickpocket'].includes(id)) {
				const template = this.template('takeItem', kwArgs.from);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[ITEM]', this.effect(item))
					.replace('[SOURCE]', this.pokemon(target || kwArgs.of));
			}
			if (id === 'frisk') {
				const hasTarget = kwArgs.of && pokemon && kwArgs.of !== pokemon;
				const template = this.template(hasTarget ? 'activate' : 'activateNoTarget', "Frisk");
				return line1 + template.replace('[POKEMON]', this.pokemon(kwArgs.of)).replace('[ITEM]', this.effect(item))
					.replace('[TARGET]', this.pokemon(pokemon));
			}
			if (kwArgs.from) {
				const template = this.template('addItem', kwArgs.from);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[ITEM]', this.effect(item));
			}
			const template = this.template('start', item, 'NODEFAULT');
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}
		case '-enditem': {
			const [, pokemon, item] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (kwArgs.eat) {
				const template = this.template('eatItem', kwArgs.from);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[ITEM]', this.effect(item));
			}
			const id = BattleTextParser.effectId(kwArgs.from);
			if (id === 'gem') {
				const template = this.template('useGem', item);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[ITEM]', this.effect(item))
					.replace('[MOVE]', kwArgs.move);
			}
			if (id === 'stealeat') {
				const template = this.template('removeItem', "Bug Bite");
				return line1 + template.replace('[SOURCE]', this.pokemon(kwArgs.of)).replace('[ITEM]', this.effect(item));
			}
			if (kwArgs.from) {
				const template = this.template('removeItem', kwArgs.from);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[ITEM]', this.effect(item))
					.replace('[SOURCE]', this.pokemon(kwArgs.of));
			}
			if (kwArgs.weaken) {
				const template = this.template('activateWeaken');
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[ITEM]', this.effect(item));
			}
			let template = this.template('end', item, 'NODEFAULT');
			if (!template) template = this.template('activateItem').replace('[ITEM]', this.effect(item));
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[TARGET]', this.pokemon(kwArgs.of));
		}
		case '-status': {
			const [, pokemon, status] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (kwArgs.from?.startsWith('item:')) {
				const template = this.template('startFromItem', status);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[ITEM]', this.effect(kwArgs.from));
			}
			if (BattleTextParser.effectId(kwArgs.from) === 'rest') {
				const template = this.template('startFromRest', status);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
			}
			const template = this.template('start', status);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}
		case '-curestatus': {
			const [, pokemon, status] = args;
			if (BattleTextParser.effectId(kwArgs.from) === 'naturalcure') {
				const template = this.template('activate', kwArgs.from);
				return template.replace('[POKEMON]', this.pokemon(pokemon));
			}
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (kwArgs.from?.startsWith('item:')) {
				const template = this.template('endFromItem', status);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[ITEM]', this.effect(kwArgs.from));
			}
			if (kwArgs.thaw) {
				const template = this.template('endFromMove', status);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[MOVE]', this.effect(kwArgs.from));
			}
			let template = this.template('end', status, 'NODEFAULT');
			if (!template) template = this.template('end').replace('[EFFECT]', status);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}
		case '-cureteam': {
			return this.template('activate', kwArgs.from);
		}
		case '-singleturn':
		case '-singlemove': {
			const [, pokemon, effect] = args;
			const line1 = this.maybeAbility(effect, kwArgs.of || pokemon) ||
				this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			const id = BattleTextParser.effectId(effect);
			if (id === 'instruct') {
				const template = this.template('activate', effect);
				return line1 + template.replace('[POKEMON]', this.pokemon(kwArgs.of)).replace('[TARGET]', this.pokemon(pokemon));
			}
			let template = this.template('start', effect, 'NODEFAULT');
			if (!template) template = this.template('start').replace('[EFFECT]', this.effect(effect));
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[SOURCE]', this.pokemon(kwArgs.of))
				.replace('[TEAM]', this.team(pokemon.slice(0, 2)));
		}
		case '-sidestart': {
			const [, side, effect] = args;
			let template = this.template('start', effect, 'NODEFAULT');
			if (!template) template = this.template('startTeamEffect').replace('[EFFECT]', this.effect(effect));
			return template.replace('[TEAM]', this.team(side)).replace('[PARTY]', this.party(side));
		}
		case '-sideend': {
			const [, side, effect] = args;
			let template = this.template('end', effect, 'NODEFAULT');
			if (!template) template = this.template('endTeamEffect').replace('[EFFECT]', this.effect(effect));
			return template.replace('[TEAM]', this.team(side)).replace('[PARTY]', this.party(side));
		}
		case '-weather': {
			const [, weather] = args;
			if (!weather || weather === 'none') {
				const template = this.template('end', kwArgs.from, 'NODEFAULT');
				if (!template) return this.template('endFieldEffect').replace('[EFFECT]', this.effect(weather));
				return template;
			}
			if (kwArgs.upkeep) {
				return this.template('upkeep', weather, 'NODEFAULT');
			}
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of);
			let template = this.template('start', weather, 'NODEFAULT');
			if (!template) template = this.template('startFieldEffect').replace('[EFFECT]', this.effect(weather));
			return line1 + template;
		}
		case '-fieldstart':
		case '-fieldactivate': {
			const [, effect] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of);
			if (BattleTextParser.effectId(kwArgs.from) === 'hadronengine') {
				return line1 + this.template('start', 'hadronengine').replace('[POKEMON]', this.pokemon(kwArgs.of));
			}
			let templateId = cmd.slice(6);
			if (BattleTextParser.effectId(effect) === 'perishsong') templateId = 'start';
			let template = this.template(templateId, effect, 'NODEFAULT');
			if (!template) template = this.template('startFieldEffect').replace('[EFFECT]', this.effect(effect));
			return line1 + template.replace('[POKEMON]', this.pokemon(kwArgs.of));
		}
		case '-fieldend': {
			const [, effect] = args;
			let template = this.template('end', effect, 'NODEFAULT');
			if (!template) template = this.template('endFieldEffect').replace('[EFFECT]', this.effect(effect));
			return template;
		}
		case '-sethp': {
			const effect = kwArgs.from;
			return this.template('activate', effect);
		}
		case '-message': {
			const [, message] = args;
			return '  ' + message + '\n';
		}
		case '-hint': {
			const [, message] = args;
			return '  (' + message + ')\n';
		}
		case '-activate': {
			let [, pokemon, effect, target] = args;
			const id = BattleTextParser.effectId(effect);
			if (id === 'celebrate') {
				return this.template('activate', 'celebrate').replace('[TRAINER]', this.trainer(pokemon.slice(0, 2)));
			}
			if (!target &&
				['hyperdrill', 'hyperspacefury', 'hyperspacehole', 'phantomforce', 'shadowforce', 'feint'].includes(id)) {
				[pokemon, target] = [kwArgs.of, pokemon];
				if (!pokemon) pokemon = target;
			}
			if (!target) target = kwArgs.of || pokemon;
			let line1 = this.maybeAbility(effect, pokemon);
			if (id === 'lockon' || id === 'mindreader') {
				const template = this.template('start', effect);
				return line1 + template.replace('[POKEMON]', this.pokemon(kwArgs.of)).replace('[SOURCE]', this.pokemon(pokemon));
			}
			if ((id === 'mummy' || id === 'lingeringaroma') && kwArgs.ability) {
				line1 += this.ability(kwArgs.ability, target);
				line1 += this.ability(id === 'mummy' ? 'Mummy' : 'Lingering Aroma', target);
				const template = this.template('changeAbility', id);
				return line1 + template.replace('[TARGET]', this.pokemon(target));
			}
			if (id === 'commander') {
				// Commander didn't have a message prior to v1.2.0 of SV
				// so this is for backwards compatibility
				if (target === pokemon) return line1;
				const template = this.template('activate', id);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace(/\[TARGET\]/g, this.pokemon(target));
			}
			let templateId = 'activate';
			if (id === 'forewarn' && pokemon === target) {
				templateId = 'activateNoTarget';
			}
			if ((id === 'protosynthesis' || id === 'quarkdrive') && kwArgs.fromitem) {
				templateId = 'activateFromItem';
			}
			if (id === 'orichalcumpulse' && kwArgs.source) {
				templateId = 'start';
			}
			let template = this.template(templateId, effect, 'NODEFAULT');
			if (!template) {
				if (line1) return line1; // Abilities don't have a default template
				template = this.template('activate');
				return line1 + template.replace('[EFFECT]', this.effect(effect));
			}
			if (id === 'brickbreak') {
				template = template.replace('[TEAM]', this.team(target.slice(0, 2)));
			}
			if (kwArgs.ability) {
				line1 += this.ability(kwArgs.ability, pokemon);
			}
			if (kwArgs.ability2) {
				line1 += this.ability(kwArgs.ability2, target);
			}
			if (kwArgs.move || kwArgs.number || kwArgs.item || kwArgs.name) {
				template = template.replace('[MOVE]', kwArgs.move).replace('[NUMBER]', kwArgs.number)
					.replace('[ITEM]', kwArgs.item).replace('[NAME]', kwArgs.name);
			}
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[TARGET]', this.pokemon(target))
				.replace('[SOURCE]', this.pokemon(kwArgs.of));
		}
		case '-prepare': {
			const [, pokemon, effect, target] = args;
			const template = this.template('prepare', effect);
			return template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[TARGET]', this.pokemon(target));
		}
		case '-damage': {
			const [, pokemon, , percentage] = args;
			let template = this.template('damage', kwArgs.from, 'NODEFAULT');
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			const id = BattleTextParser.effectId(kwArgs.from);
			if (template) {
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
			}
			if (!kwArgs.from) {
				template = this.template(percentage ? 'damagePercentage' : 'damage');
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[PERCENTAGE]', percentage);
			}
			if (kwArgs.from.startsWith('item:')) {
				template = this.template(kwArgs.of ? 'damageFromPokemon' : 'damageFromItem');
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[ITEM]', this.effect(kwArgs.from))
					.replace('[SOURCE]', this.pokemon(kwArgs.of));
			}
			if (kwArgs.partiallytrapped || id === 'bind' || id === 'wrap') {
				template = this.template('damageFromPartialTrapping');
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[MOVE]', this.effect(kwArgs.from));
			}
			template = this.template('damage');
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}
		case '-heal': {
			const [, pokemon] = args;
			let template = this.template('heal', kwArgs.from, 'NODEFAULT');
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (template) {
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[SOURCE]', this.pokemon(kwArgs.of))
					.replace('[NICKNAME]', kwArgs.wisher);
			}
			if (kwArgs.from && !kwArgs.from.startsWith('ability:')) {
				template = this.template('healFromEffect');
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[EFFECT]', this.effect(kwArgs.from));
			}
			template = this.template('heal');
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}
		case '-boost':
		case '-unboost': {
			let [, pokemon, stat, num] = args;
			if (stat === 'spa' && this.gen === 1) stat = 'spc';
			const amount = parseInt(num, 10);
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			let templateId = cmd.slice(1);
			if (amount >= 3) templateId += '3';
			else if (amount >= 2) templateId += '2';
			else if (amount === 0) templateId += '0';
			if (amount && kwArgs.zeffect) {
				templateId += (kwArgs.multiple ? 'MultipleFromZEffect' : 'FromZEffect');
			} else if (amount && kwArgs.from?.startsWith('item:')) {
				const template = this.template(templateId + 'FromItem', kwArgs.from);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[STAT]', BattleTextParser.stat(stat))
					.replace('[ITEM]', this.effect(kwArgs.from));
			}
			const template = this.template(templateId, kwArgs.from);
			return line1 + template.replace(/\[POKEMON\]/g, this.pokemon(pokemon)).replace('[STAT]', BattleTextParser.stat(stat));
		}
		case '-setboost': {
			const [, pokemon] = args;
			const effect = kwArgs.from;
			const line1 = this.maybeAbility(effect, kwArgs.of || pokemon);
			const template = this.template('boost', effect);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}
		case '-swapboost': {
			const [, pokemon, target] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			const id = BattleTextParser.effectId(kwArgs.from);
			let templateId = 'swapBoost';
			if (id === 'guardswap') templateId = 'swapDefensiveBoost';
			if (id === 'powerswap') templateId = 'swapOffensiveBoost';
			const template = this.template(templateId, kwArgs.from);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[TARGET]', this.pokemon(target));
		}
		case '-copyboost': {
			const [, pokemon, target] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			const template = this.template('copyBoost', kwArgs.from);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[TARGET]', this.pokemon(target));
		}
		case '-clearboost':
		case '-clearpositiveboost':
		case '-clearnegativeboost': {
			const [, pokemon, source] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			let templateId = 'clearBoost';
			if (kwArgs.zeffect) templateId = 'clearBoostFromZEffect';
			const template = this.template(templateId, kwArgs.from);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[SOURCE]', this.pokemon(source));
		}
		case '-invertboost': {
			const [, pokemon] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			const template = this.template('invertBoost', kwArgs.from);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}
		case '-clearallboost': {
			return this.template('clearAllBoost', kwArgs.from);
		}
		case '-crit':
		case '-supereffective':
		case '-resisted': {
			const [, pokemon] = args;
			let templateId = cmd.slice(1);
			if (templateId === 'supereffective') templateId = 'superEffective';
			if (kwArgs.spread) templateId += 'Spread';
			const template = this.template(templateId);
			return template.replace('[POKEMON]', this.pokemon(pokemon));
		}
		case '-block': {
			const [, pokemon, effect, move, attacker] = args;
			const line1 = this.maybeAbility(effect, kwArgs.of || pokemon);
			const id = BattleTextParser.effectId(effect);
			let templateId = 'block';
			if (id === 'mist' && this.gen <= 2) templateId = `blockGen${this.gen}`;
			const template = this.template(templateId, effect);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon))
				.replace('[SOURCE]', this.pokemon(attacker || kwArgs.of)).replace('[MOVE]', move);
		}
		case '-fail': {
			const [, pokemon, effect, stat] = args;
			const id = BattleTextParser.effectId(effect);
			const blocker = BattleTextParser.effectId(kwArgs.from);
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			let templateId = 'block';
			if (['desolateland', 'primordialsea'].includes(blocker) &&
				!['sunnyday', 'raindance', 'sandstorm', 'hail', 'snowscape', 'chillyreception'].includes(id)) {
				templateId = 'blockMove';
			} else if (blocker === 'uproar' && kwArgs.msg) {
				templateId = 'blockSelf';
			}
			let template = this.template(templateId, kwArgs.from);
			if (template) {
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
			}

			if (id === 'unboost') {
				template = this.template(stat ? 'failSingular' : 'fail', 'unboost');
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[STAT]', stat);
			}

			templateId = 'fail';
			if (['brn', 'frz', 'par', 'psn', 'slp', 'substitute', 'shedtail'].includes(id)) {
				templateId = 'alreadyStarted';
			}
			if (kwArgs.heavy) templateId = 'failTooHeavy';
			if (kwArgs.weak) templateId = 'fail';
			if (kwArgs.forme) templateId = 'failWrongForme';
			template = this.template(templateId, id);
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-immune': {
			const [, pokemon] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			let template = this.template('block', kwArgs.from);
			if (!template) {
				const templateId = kwArgs.ohko ? 'immuneOHKO' : 'immune';
				template = this.template(pokemon ? templateId : 'immuneNoPokemon', kwArgs.from);
			}
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-miss': {
			const [, source, pokemon] = args;
			const line1 = this.maybeAbility(kwArgs.from, kwArgs.of || pokemon);
			if (!pokemon) {
				const template = this.template('missNoPokemon');
				return line1 + template.replace('[SOURCE]', this.pokemon(source));
			}
			const template = this.template('miss');
			return line1 + template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-center': case '-ohko': case '-combine': {
			return this.template(cmd.slice(1));
		}

		case '-notarget': {
			return this.template('noTarget');
		}

		case '-mega': case '-primal': {
			const [, pokemon, species, item] = args;
			let id = '';
			let templateId = cmd.slice(1);
			if (species === 'Rayquaza') {
				id = 'dragonascent';
				templateId = 'megaNoItem';
			}
			if (!id && cmd === '-mega' && this.gen < 7) templateId = 'megaGen6';
			if (!item && cmd === '-mega') templateId = 'megaNoItem';
			let template = this.template(templateId, id);
			const side = pokemon.slice(0, 2);
			const pokemonName = this.pokemon(pokemon);
			if (cmd === '-mega') {
				const template2 = this.template('transformMega');
				template += template2.replace('[POKEMON]', pokemonName).replace('[SPECIES]', species);
			}
			return template.replace('[POKEMON]', pokemonName).replace('[ITEM]', item).replace('[TRAINER]', this.trainer(side));
		}

		case '-terastallize': {
			const [, pokemon, type] = args;
			const id = '';
			const templateId = cmd.slice(1);
			const template = this.template(templateId, id);
			const pokemonName = this.pokemon(pokemon);
			return template.replace('[POKEMON]', pokemonName).replace('[TYPE]', type);
		}

		case '-zpower': {
			const [, pokemon] = args;
			const template = this.template('zPower');
			return template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-burst': {
			const [, pokemon] = args;
			const template = this.template('activate', "Ultranecrozium Z");
			return template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-zbroken': {
			const [, pokemon] = args;
			const template = this.template('zBroken');
			return template.replace('[POKEMON]', this.pokemon(pokemon));
		}

		case '-hitcount': {
			const [, , num] = args;
			if (num === '1') {
				return this.template('hitCountSingular');
			}
			return this.template('hitCount').replace('[NUMBER]', num);
		}

		case '-waiting': {
			const [, pokemon, target] = args;
			const template = this.template('activate', "Water Pledge");
			return template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[TARGET]', this.pokemon(target));
		}

		case '-anim': {
			return '';
		}

		default: {
			return null;
		}
		}
	}
}
// --- Exports for NodeJS ---
export {
	BattleTextParser,
	toID,
	BattleText,
};
