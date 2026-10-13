package repository

import (
	"app/internal/app/ds"
	"context"
	"errors"
	"fmt"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func (r *Repository) RegisterUser(ctx context.Context, login, password string) (ds.User, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return ds.User{}, err
	}
	user := ds.User{Login: login, Password: string(hash), IsModerator: false}
	err = r.db.WithContext(ctx).Create(&user).Error
	if errors.Is(err, gorm.ErrDuplicatedKey) {
		return ds.User{}, fmt.Errorf("логин уже занят: %w", ErrConflict)
	}
	return user, err
}
