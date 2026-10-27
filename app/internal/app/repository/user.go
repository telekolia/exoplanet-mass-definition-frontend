package repository

import (
	"app/internal/app/ds"
	"context"
	"errors"
	"fmt"

	"gorm.io/gorm"
)

func (r *Repository) RegisterUser(ctx context.Context, login, password string) (ds.User, error) {
	user := ds.User{Login: login, Password: password, IsModerator: false}
	err := r.db.WithContext(ctx).Create(&user).Error
	if errors.Is(err, gorm.ErrDuplicatedKey) {
		return ds.User{}, fmt.Errorf("логин уже занят: %w", ErrConflict)
	}
	return user, err
}
