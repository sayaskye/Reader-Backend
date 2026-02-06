CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nickname" text NOT NULL,
	"nombre" text NOT NULL,
	"apellido" text NOT NULL,
	"fecha_nacimiento" date NOT NULL,
	"correo" text NOT NULL,
	"genero" text NOT NULL,
	"pais" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
