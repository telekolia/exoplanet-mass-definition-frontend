/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface DsFullTelescopeSerializer {
  creation_time?: string;
  creator_id?: number;
  description?: string;
  forming_time?: string;
  id?: number;
  image_name?: string;
  image_url?: string;
  is_creator?: boolean;
  is_liked?: number;
  latitude?: number;
  likes_count?: number;
  longitude?: number;
  status?: string;
  title?: string;
  video_name?: string;
  video_url?: string;
}

export interface DsLikeTelescopeRequest {
  like: 0 | 1;
}

export interface DsLikeTelescopeResponse {
  is_liked?: number;
  likes_count?: number;
}

export interface DsLoginRequest {
  /** @maxLength 64 */
  login: string;
  /** @maxLength 100 */
  password: string;
}

export interface DsPublishTelescopeRequest {
  /** @maxLength 255 */
  description: string;
  /**
   * @min -90
   * @max 90
   */
  latitude: number;
  /**
   * @min -180
   * @max 180
   */
  longitude: number;
}

export interface DsRegisterUserRequest {
  /** @maxLength 64 */
  login: string;
  /**
   * @minLength 6
   * @maxLength 100
   */
  password: string;
}

export interface DsTelescopeSerializer {
  creation_time?: string;
  creator_id?: number;
  description?: string;
  forming_time?: string;
  id?: number;
  image_name?: string;
  image_url?: string;
  is_creator?: boolean;
  latitude?: number;
  likes_count?: number;
  longitude?: number;
  status?: string;
  title?: string;
  video_name?: string;
  video_url?: string;
}

export interface DsUser {
  id?: number;
  is_moderator?: boolean;
  login?: string;
}

export interface SessionLoginResponse {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "/api",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Телескопная API
 * @version 1.0
 * @baseUrl /api
 * @contact
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  telescopes = {
    /**
     * No description
     *
     * @tags Телескопы
     * @name TelescopesList
     * @summary Список опубликованных телескопов
     * @request GET:/telescopes
     */
    telescopesList: (
      query?: {
        /**
         * Минимальная широта
         * @default -90
         */
        min?: number;
        /**
         * Максимальная широта
         * @default 90
         */
        max?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsTelescopeSerializer[], void>({
        path: `/telescopes`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Телескопы
     * @name TelescopesCreate
     * @summary Создание черновика
     * @request POST:/telescopes
     * @secure
     */
    telescopesCreate: (
      data: {
        /** Название */
        title: string;
        /**
         * Изображение до 5 МиБ
         * @format binary
         */
        image?: File;
        /**
         * Видео до 50 МиБ
         * @format binary
         */
        video?: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsTelescopeSerializer, void>({
        path: `/telescopes`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает null, если черновика нет.
     *
     * @tags Телескопы
     * @name DraftList
     * @summary Черновик текущего пользователя
     * @request GET:/telescopes/draft
     * @secure
     */
    draftList: (params: RequestParams = {}) =>
      this.request<DsTelescopeSerializer, void>({
        path: `/telescopes/draft`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Телескопы
     * @name FeedList
     * @summary Карточка ленты
     * @request GET:/telescopes/feed
     */
    feedList: (
      query?: {
        /** ID карточки; без ID возвращается первая */
        id?: number;
        /** Следующая карточка после id */
        next?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsFullTelescopeSerializer, void>({
        path: `/telescopes/feed`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Телескопы
     * @name TelescopesUpdate
     * @summary Публикация своего черновика
     * @request PUT:/telescopes/{id}
     * @secure
     */
    telescopesUpdate: (
      id: number,
      body: DsPublishTelescopeRequest,
      params: RequestParams = {},
    ) =>
      this.request<DsTelescopeSerializer, void>({
        path: `/telescopes/${id}`,
        method: "PUT",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Телескопы
     * @name TelescopesDelete
     * @summary Логическое удаление своего телескопа
     * @request DELETE:/telescopes/{id}
     * @secure
     */
    telescopesDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/telescopes/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Телескопы
     * @name LikesCreate
     * @summary Установка или отмена лайка
     * @request POST:/telescopes/{id}/likes
     * @secure
     */
    likesCreate: (
      id: number,
      body: DsLikeTelescopeRequest,
      params: RequestParams = {},
    ) =>
      this.request<DsLikeTelescopeResponse, void>({
        path: `/telescopes/${id}/likes`,
        method: "POST",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * No description
     *
     * @tags Пользователи
     * @name UsersCreate
     * @summary Регистрация пользователя
     * @request POST:/users
     */
    usersCreate: (body: DsRegisterUserRequest, params: RequestParams = {}) =>
      this.request<DsUser, void>({
        path: `/users`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Пользователи
     * @name LoginCreate
     * @summary Получение JWT по логину и паролю
     * @request POST:/users/login
     */
    loginCreate: (body: DsLoginRequest, params: RequestParams = {}) =>
      this.request<SessionLoginResponse, void>({
        path: `/users/login`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Пользователи
     * @name LogoutCreate
     * @summary Отзыв текущего JWT
     * @request POST:/users/logout
     * @secure
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/users/logout`,
        method: "POST",
        secure: true,
        ...params,
      }),
  };
}
