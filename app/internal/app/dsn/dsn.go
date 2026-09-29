package dsn

import (
	"fmt"
	"os"
)

func FromEnv() string {
	host := os.Getenv("DATABASE_HOST")
	if host == "" {
		return ""
	}
	port := os.Getenv("DATABASE_PORT")
	user := os.Getenv("DATABASE_USER")
	pass := os.Getenv("DATABASE_PASS")
	dbname := os.Getenv("DATABASE_NAME")

	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host, port, user, pass, dbname)
}
