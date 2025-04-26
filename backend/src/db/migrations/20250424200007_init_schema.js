exports.up = async function (knex) {
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
  return knex.schema
    .createTable("cars", (t) => {
      t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      t.string("brand").notNullable();
      t.string("model").notNullable();
      t.jsonb("pricing").notNullable();
      t.string("image_url");
    })
    .createTable("users", (t) => {
      t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      t.string("email").notNullable().unique();
      t.timestamp("driving_license_valid_until").notNullable();
    })
    .createTable("bookings", (t) => {
      t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      t.uuid("user_id").references("id").inTable("users").onDelete("cascade");
      t.uuid("car_id").references("id").inTable("cars").onDelete("cascade");
      t.date("start_date").notNullable();
      t.date("end_date").notNullable();
      t.decimal("total_price", 10, 2).notNullable();
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("bookings")
    .dropTableIfExists("users")
    .dropTableIfExists("cars");
};
