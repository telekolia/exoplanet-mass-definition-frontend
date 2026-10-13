package handler

import (
	"app/internal/app/ds"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func (h *Handler) RegisterUserAPI(ctx *gin.Context) {
	var request ds.RegisterUserRequest
	if !h.bindJSON(ctx, &request) {
		return
	}
	request.Login = strings.TrimSpace(request.Login)
	if request.Login == "" || len([]byte(request.Password)) > 72 {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": "логин не может быть пустым; пароль — не более 72 байт"})
		return
	}
	user, err := h.Repository.RegisterUser(ctx.Request.Context(), request.Login, request.Password)
	if err != nil {
		h.repositoryError(ctx, err)
		return
	}
	ctx.JSON(http.StatusCreated, gin.H{"status": "success", "data": user, "message": "пользователь зарегистрирован"})
}

func (h *Handler) LoginUserAPI(ctx *gin.Context) {
	ctx.JSON(http.StatusNotImplemented, gin.H{"status": "fail", "message": "аутентификация будет реализована в лабораторной 4; сейчас используется фиксированный пользователь"})
}

func (h *Handler) LogoutUserAPI(ctx *gin.Context) {
	ctx.JSON(http.StatusNotImplemented, gin.H{"status": "fail", "message": "деавторизация будет реализована в лабораторной 4; текущий пользователь не меняется"})
}
