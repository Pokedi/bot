export default (items = [], user_id, sql) => {
    return items.map(x => {
        switch (x.type) {
            case 0:
                return sql`UPDATE users SET bal = bal + ${x.amount || 100} WHERE id = ${user_id}`;
            case 1:
                return sql`UPDATE users SET redeem = redeem + ${x.amount || 1} WHERE id = ${user_id}`;
            case 2:
                if (x.item_id)
                    return sql`INSERT INTO user_inventory ${sql({
                        item_id: x.item_id,
                        user_id,
                        amount: x.amount
                    })} ON CONFLICT (item_id, user_id) DO UPDATE SET amount = user_inventory.amount + EXCLUDED.amount`;
        }
    }).filter(x => x);
}