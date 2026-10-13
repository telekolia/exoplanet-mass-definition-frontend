package handler

import (
	"app/internal/app/ds"
	"app/internal/app/repository"
	"errors"
	"math"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type Handler struct {
	Repository *repository.Repository
}

func NewHandler(r *repository.Repository) *Handler {
	return &Handler{
		Repository: r,
	}
}

func (h *Handler) RegisterHandler(router *gin.Engine) {
	router.GET("/telescope-feed", h.GetTelescopeFeed)
	router.GET("/telescope-feed/:id", h.GetTelescopeFeed)
	router.GET("/telescope-tile", h.GetTelescopeTile)
	router.GET("/telescope-draft", h.GetTelescopeDraft)

	router.POST("/telescope/create", h.CreateTelescopeDraft)
	router.POST("/telescope/publish", h.PublishTelescope)
	router.POST("/telescope/delete", h.DeleteTelescope)
}

func (h *Handler) RegisterStatic(router *gin.Engine) {
	router.LoadHTMLGlob("templates/*")
	router.Static("/static", "./resources")
}

func (h *Handler) errorHandler(ctx *gin.Context, errorStatusCode int, err error) {
	logrus.Error(err.Error())
	ctx.JSON(errorStatusCode, gin.H{
		"status":      "error",
		"description": err.Error(),
	})
}

func (h *Handler) GetTelescopeTile(ctx *gin.Context) {
	var telescopes []ds.Telescope
	var err error

	minLatitude := -90.0
	maxLatitude := 90.0

	if v := ctx.Query("min"); v != "" {
		if parsed, e := strconv.ParseFloat(v, 64); e == nil {
			minLatitude = parsed
		}
	}
	if v := ctx.Query("max"); v != "" {
		if parsed, e := strconv.ParseFloat(v, 64); e == nil {
			maxLatitude = parsed
		}
	}

	telescopes, err = h.Repository.GetTelescopesByLatitudeRange(minLatitude, maxLatitude)
	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, err)
		return
	}

	ids := make([]uint, 0, len(telescopes))
	for _, t := range telescopes {
		ids = append(ids, t.ID)
	}

	counts, err := h.Repository.GetTelescopeLikesCounts(ids)
	if err != nil {
		logrus.Error("likes counts:", err)
		counts = map[uint]int64{}
	}

	ctx.HTML(http.StatusOK, "telescope-tile.html", gin.H{
		"telescopes": telescopes,
		"min":        minLatitude,
		"max":        maxLatitude,
		"likes":      counts,
	})
}

func (h *Handler) GetTelescopeFeed(ctx *gin.Context) {
	idStr := ctx.Param("id")
	var id int
	var err error
	if idStr != "" {
		id, err = strconv.Atoi(idStr)
		if err != nil {
			ctx.String(http.StatusBadRequest, "Invalid ID")
			return
		}
	}

	next := ctx.Query("next") == "true"

	telescope, err := h.Repository.GetTelescopeFeedItem(id, next)
	if err != nil {
		ctx.String(http.StatusNotFound, err.Error())
		return
	}

	likesCount, err := h.Repository.GetTelescopeLikesCount(telescope.ID)
	if err != nil {
		logrus.Error("likes count:", err)
		likesCount = 0
	}

	ctx.HTML(http.StatusOK, "telescope-feed.html", gin.H{
		"telescope":  telescope,
		"likesCount": likesCount,
	})
}

func (h *Handler) GetTelescopeDraft(ctx *gin.Context) {
	telescope, err := h.Repository.GetTelescopeDraft()
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		ctx.String(http.StatusInternalServerError, err.Error())
		return
	}

	ctx.HTML(http.StatusOK, "telescope-draft.html", gin.H{"telescope": telescope})
}

func (h *Handler) CreateTelescopeDraft(c *gin.Context) {
	title := c.PostForm("title")
	if title == "" {
		title = "Новый телескоп"
	}

	_, err := h.Repository.CreateDraftTelescope(2, title)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.Redirect(http.StatusFound, "/telescope-draft")
}

func (h *Handler) PublishTelescope(c *gin.Context) {
	idStr := c.PostForm("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		c.String(http.StatusBadRequest, "Некорректный ID")
		return
	}

	description := c.PostForm("description")
	latitude, err := strconv.ParseFloat(c.PostForm("latitude"), 64)
	if err != nil || math.IsNaN(latitude) || latitude < -90 || latitude > 90 {
		c.String(http.StatusBadRequest, "Некорректная широта")
		return
	}
	longitude, err := strconv.ParseFloat(c.PostForm("longitude"), 64)
	if err != nil || math.IsNaN(longitude) || longitude < -180 || longitude > 180 {
		c.String(http.StatusBadRequest, "Некорректная долгота")
		return
	}

	err = h.Repository.PublishTelescope(uint(id), description, latitude, longitude)
	if err != nil {
		c.String(http.StatusBadRequest, "Ошибка при публикации")
		return
	}

	c.Redirect(http.StatusFound, "/telescope-tile")
}

func (h *Handler) DeleteTelescope(c *gin.Context) {
	idStr := c.PostForm("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		c.String(http.StatusBadRequest, "Некорректный ID")
		return
	}

	err = h.Repository.DeleteTelescope(id)
	if err != nil {
		c.String(http.StatusInternalServerError, "Ошибка при удалении: "+err.Error())
		return
	}

	c.Redirect(http.StatusFound, "/telescope-tile")
}
