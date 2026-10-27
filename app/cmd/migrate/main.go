package main

import (
	"app/internal/app/ds"
	"app/internal/app/dsn"
	"app/internal/app/session"
	"errors"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	_ = godotenv.Load()
	db, err := gorm.Open(postgres.Open(dsn.FromEnv()), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	err = db.AutoMigrate(
		&ds.User{},
		&ds.Telescope{},
		&ds.TelescopeLike{},
	)
	if err != nil {
		panic("cant migrate db")
	}
	user := session.GetCurrentUser()
	err = db.First(&user, user.ID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		user = ds.User{ID: session.CurrentUserID, Login: "lab3-user", Password: "test123"}
		if err := db.Create(&user).Error; err != nil {
			panic(err)
		}
	} else if err != nil {
		panic(err)
	}
	if err := db.Exec("SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users), true)").Error; err != nil {
		panic(err)
	}
}
