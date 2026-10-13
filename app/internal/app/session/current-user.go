package session

import (
	"app/internal/app/ds"
	"sync"
)

const CurrentUserID uint = 2

var (
	currentUser ds.User
	userOnce    sync.Once
)

func GetCurrentUser() ds.User {
	userOnce.Do(func() { currentUser = ds.User{ID: CurrentUserID} })
	return currentUser
}
