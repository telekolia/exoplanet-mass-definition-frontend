package handler

import (
	"app/internal/app/ds"
	"app/internal/app/repository"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
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
	if err != nil {
		ctx.String(http.StatusNotFound, err.Error())
		return
	}

	ctx.HTML(http.StatusOK, "telescope-draft.html", gin.H{"telescope": telescope})
}

func (h *Handler) CreateTelescopeDraft(c *gin.Context) {
	name := c.PostForm("name")
	if name == "" {
		name = "Новый композитор"
	}

	_, err := h.Repository.CreateDraftTelescope(2, name)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.Redirect(http.StatusFound, "/composer-draft")
}

func (h *Handler) PublishTelescope(c *gin.Context) {
	idStr := c.PostForm("id")
	id, _ := strconv.Atoi(idStr)

	description := c.PostForm("description")
	freq1, _ := strconv.ParseFloat(c.PostForm("freq1"), 64)
	freq2, _ := strconv.ParseFloat(c.PostForm("freq2"), 64)

	err := h.Repository.PublishTelescope(uint(id), description, freq1, freq2)
	if err != nil {
		c.String(http.StatusBadRequest, "Ошибка при публикации")
		return
	}

	c.Redirect(http.StatusFound, "/composers-grid")
}

func (h *Handler) DeleteTelescope(c *gin.Context) {
	idStr := c.PostForm("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.String(http.StatusBadRequest, "Некорректный ID")
		return
	}

	err = h.Repository.DeleteTelescope(id)
	if err != nil {
		c.String(http.StatusInternalServerError, "Ошибка при удалении: "+err.Error())
		return
	}

	c.Redirect(http.StatusFound, "/composers-grid")
}
