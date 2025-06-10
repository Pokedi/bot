export default function replyWrapper(msg, options) {
    if (msg.reply) {
        if (typeof options === "string") {
            return msg.reply(options);
        }

        // Remove interaction-only properties if replying to a Message
        if (msg.constructor.name === "Message") {
            const safe = { content: options.content };
            return msg.reply(safe);
        }

        // Safe for interactions
        return msg.reply(options);
    }
}