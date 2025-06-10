export default function replyWrapper(msg, options) {

    if (msg.reply) {

        if (typeof options === "string") {
            return msg.reply(options);
        }

        if (msg.constructor.name === "ChatInputCommandInteraction")
            // Safe for interactions
        return msg.reply(options);
        
        // Remove interaction-only properties if replying to a Message
        const safe = { content: options.content };
        return msg.reply(safe);

    }
    
}