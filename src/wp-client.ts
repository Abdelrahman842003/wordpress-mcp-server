import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import {
  WordPressConfig,
  ListPostsParams,
  CreatePostParams,
  UpdatePostParams,
  CreatePageParams,
  UpdatePageParams,
  UpdateSettingsParams,
  CptRequestParams,
  RawRequestParams,
} from './types.js';

export class WordPressClient {
  private axiosInstance: AxiosInstance;
  private baseUrl: string;

  constructor(config: WordPressConfig) {
    let cleanUrl = config.baseUrl.trim().replace(/\/+$/, '');
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    this.baseUrl = cleanUrl;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'WordPress-MCP-Server/1.0.0',
    };

    if (config.username && config.applicationPassword) {
      const credentials = `${config.username}:${config.applicationPassword}`;
      const token = Buffer.from(credentials).toString('base64');
      headers['Authorization'] = `Basic ${token}`;
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers,
      timeout: 30000,
    });
  }

  private formatError(error: any): string {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      const message = data?.message || error.message;
      const code = data?.code || 'AXIOS_ERROR';
      return `WordPress API Error [${status || 'UNKNOWN'}] (${code}): ${message}`;
    }
    return error instanceof Error ? error.message : String(error);
  }

  // --- Site Information ---
  async getSiteInfo() {
    try {
      const response = await this.axiosInstance.get('/wp-json');
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  // --- Posts ---
  async listPosts(params?: ListPostsParams) {
    try {
      const response = await this.axiosInstance.get('/wp-json/wp/v2/posts', { params });
      return {
        total: response.headers['x-wp-total'] ? parseInt(response.headers['x-wp-total'], 10) : undefined,
        totalPages: response.headers['x-wp-totalpages'] ? parseInt(response.headers['x-wp-totalpages'], 10) : undefined,
        posts: response.data,
      };
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async getPost(id: number | string) {
    try {
      const response = await this.axiosInstance.get(`/wp-json/wp/v2/posts/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async createPost(params: CreatePostParams) {
    try {
      const response = await this.axiosInstance.post('/wp-json/wp/v2/posts', params);
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async updatePost(params: UpdatePostParams) {
    try {
      const { id, ...data } = params;
      const response = await this.axiosInstance.post(`/wp-json/wp/v2/posts/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async deletePost(id: number, force: boolean = false) {
    try {
      const response = await this.axiosInstance.delete(`/wp-json/wp/v2/posts/${id}`, {
        params: { force },
      });
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  // --- Pages ---
  async listPages(params?: Record<string, any>) {
    try {
      const response = await this.axiosInstance.get('/wp-json/wp/v2/pages', { params });
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async getPage(id: number | string) {
    try {
      const response = await this.axiosInstance.get(`/wp-json/wp/v2/pages/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async createPage(params: CreatePageParams) {
    try {
      const response = await this.axiosInstance.post('/wp-json/wp/v2/pages', params);
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async updatePage(params: UpdatePageParams) {
    try {
      const { id, ...data } = params;
      const response = await this.axiosInstance.post(`/wp-json/wp/v2/pages/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async deletePage(id: number, force: boolean = false) {
    try {
      const response = await this.axiosInstance.delete(`/wp-json/wp/v2/pages/${id}`, {
        params: { force },
      });
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  // --- Media ---
  async uploadMedia(filePath: string, title?: string, altText?: string) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at path: ${filePath}`);
      }

      const form = new FormData();
      const fileStream = fs.createReadStream(filePath);
      const filename = path.basename(filePath);

      form.append('file', fileStream, filename);
      if (title) form.append('title', title);
      if (altText) form.append('alt_text', altText);

      const response = await this.axiosInstance.post('/wp-json/wp/v2/media', form, {
        headers: {
          ...form.getHeaders(),
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async listMedia(params?: Record<string, any>) {
    try {
      const response = await this.axiosInstance.get('/wp-json/wp/v2/media', { params });
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  // --- Categories & Tags ---
  async listCategories(params?: Record<string, any>) {
    try {
      const response = await this.axiosInstance.get('/wp-json/wp/v2/categories', { params });
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async createCategory(name: string, description?: string, parent?: number) {
    try {
      const response = await this.axiosInstance.post('/wp-json/wp/v2/categories', {
        name,
        description,
        parent,
      });
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async listTags(params?: Record<string, any>) {
    try {
      const response = await this.axiosInstance.get('/wp-json/wp/v2/tags', { params });
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async createTag(name: string, description?: string) {
    try {
      const response = await this.axiosInstance.post('/wp-json/wp/v2/tags', {
        name,
        description,
      });
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  // --- Comments ---
  async listComments(params?: Record<string, any>) {
    try {
      const response = await this.axiosInstance.get('/wp-json/wp/v2/comments', { params });
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async createComment(postId: number, content: string, authorName?: string, authorEmail?: string) {
    try {
      const response = await this.axiosInstance.post('/wp-json/wp/v2/comments', {
        post: postId,
        content,
        author_name: authorName,
        author_email: authorEmail,
      });
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async updateComment(commentId: number, status: 'approved' | 'hold' | 'spam' | 'trash') {
    try {
      const response = await this.axiosInstance.post(`/wp-json/wp/v2/comments/${commentId}`, {
        status,
      });
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  // --- Plugins Management ---
  async listPlugins() {
    try {
      const response = await this.axiosInstance.get('/wp-json/wp/v2/plugins');
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async installPlugin(slug: string) {
    try {
      const response = await this.axiosInstance.post('/wp-json/wp/v2/plugins', {
        slug,
        status: 'active',
      });
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async updatePluginStatus(plugin: string, status: 'active' | 'inactive') {
    try {
      const response = await this.axiosInstance.post(`/wp-json/wp/v2/plugins/${encodeURIComponent(plugin)}`, {
        status,
      });
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async deletePlugin(plugin: string) {
    try {
      const response = await this.axiosInstance.delete(`/wp-json/wp/v2/plugins/${encodeURIComponent(plugin)}`);
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  // --- Themes Management ---
  async listThemes() {
    try {
      const response = await this.axiosInstance.get('/wp-json/wp/v2/themes');
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async activateTheme(stylesheet: string) {
    try {
      const response = await this.axiosInstance.post(`/wp-json/wp/v2/themes/${encodeURIComponent(stylesheet)}`, {
        status: 'active',
      });
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  // --- Settings & Options ---
  async getSettings() {
    try {
      const response = await this.axiosInstance.get('/wp-json/wp/v2/settings');
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async updateSettings(settings: UpdateSettingsParams) {
    try {
      const response = await this.axiosInstance.post('/wp-json/wp/v2/settings', settings);
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  // --- Custom Post Types (CPTs) & Meta ---
  async getPostTypes() {
    try {
      const response = await this.axiosInstance.get('/wp-json/wp/v2/types');
      return response.data;
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  async handleCptRequest(params: CptRequestParams) {
    try {
      const { rest_base, action, id, data, params: queryParams } = params;
      const cleanBase = rest_base.startsWith('/') ? rest_base : `/wp-json/wp/v2/${rest_base}`;

      switch (action) {
        case 'list':
          return (await this.axiosInstance.get(cleanBase, { params: queryParams })).data;
        case 'get':
          if (!id) throw new Error('ID is required for CPT get action');
          return (await this.axiosInstance.get(`${cleanBase}/${id}`)).data;
        case 'create':
          return (await this.axiosInstance.post(cleanBase, data)).data;
        case 'update':
          if (!id) throw new Error('ID is required for CPT update action');
          return (await this.axiosInstance.post(`${cleanBase}/${id}`, data)).data;
        case 'delete':
          if (!id) throw new Error('ID is required for CPT delete action');
          return (await this.axiosInstance.delete(`${cleanBase}/${id}`, { params: queryParams })).data;
        default:
          throw new Error(`Unsupported action: ${action}`);
      }
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  // --- Generic Raw Request Tool ---
  async rawRequest(params: RawRequestParams) {
    try {
      let url = params.endpoint.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (!url.startsWith('/')) {
          url = `/${url}`;
        }
        if (!url.startsWith('/wp-json/')) {
          url = `/wp-json${url}`;
        }
      }

      const config: AxiosRequestConfig = {
        url,
        method: params.method || 'GET',
        params: params.params,
        data: params.data,
        headers: params.headers,
      };

      const response = await this.axiosInstance.request(config);
      return {
        status: response.status,
        headers: response.headers,
        data: response.data,
      };
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }
}
