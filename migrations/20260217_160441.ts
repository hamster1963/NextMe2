import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_comments\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`scope\` text DEFAULT 'post' NOT NULL,
  	\`post_id\` integer,
  	\`author_name\` text NOT NULL,
  	\`author_email\` text,
  	\`content\` text NOT NULL,
  	\`status\` text DEFAULT 'published',
  	\`reply_content\` text,
  	\`reply_replied_at\` text,
  	\`reply_replied_by_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`post_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`reply_replied_by_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_comments\`("id", "scope", "post_id", "author_name", "author_email", "content", "status", "reply_content", "reply_replied_at", "reply_replied_by_id", "updated_at", "created_at") SELECT "id", 'post', "post_id", "author_name", "author_email", "content", "status", "reply_content", "reply_replied_at", "reply_replied_by_id", "updated_at", "created_at" FROM \`comments\`;`)
  await db.run(sql`DROP TABLE \`comments\`;`)
  await db.run(sql`ALTER TABLE \`__new_comments\` RENAME TO \`comments\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`comments_post_idx\` ON \`comments\` (\`post_id\`);`)
  await db.run(sql`CREATE INDEX \`comments_reply_reply_replied_by_idx\` ON \`comments\` (\`reply_replied_by_id\`);`)
  await db.run(sql`CREATE INDEX \`comments_updated_at_idx\` ON \`comments\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`comments_created_at_idx\` ON \`comments\` (\`created_at\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_comments\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`post_id\` integer NOT NULL,
  	\`author_name\` text NOT NULL,
  	\`author_email\` text,
  	\`content\` text NOT NULL,
  	\`status\` text DEFAULT 'published',
  	\`reply_content\` text,
  	\`reply_replied_at\` text,
  	\`reply_replied_by_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`post_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`reply_replied_by_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_comments\`("id", "post_id", "author_name", "author_email", "content", "status", "reply_content", "reply_replied_at", "reply_replied_by_id", "updated_at", "created_at") SELECT "id", "post_id", "author_name", "author_email", "content", "status", "reply_content", "reply_replied_at", "reply_replied_by_id", "updated_at", "created_at" FROM \`comments\`;`)
  await db.run(sql`DROP TABLE \`comments\`;`)
  await db.run(sql`ALTER TABLE \`__new_comments\` RENAME TO \`comments\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`comments_post_idx\` ON \`comments\` (\`post_id\`);`)
  await db.run(sql`CREATE INDEX \`comments_reply_reply_replied_by_idx\` ON \`comments\` (\`reply_replied_by_id\`);`)
  await db.run(sql`CREATE INDEX \`comments_updated_at_idx\` ON \`comments\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`comments_created_at_idx\` ON \`comments\` (\`created_at\`);`)
}
