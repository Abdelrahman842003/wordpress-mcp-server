export interface WordPressConfig {
  baseUrl: string;
  username?: string;
  applicationPassword?: string;
}

export interface ListPostsParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  categories?: string;
  tags?: string;
  author?: number;
  slug?: string;
  order?: 'asc' | 'desc';
  orderby?: 'date' | 'title' | 'id' | 'relevance' | 'modified';
}

export interface CreatePostParams {
  title: string;
  content: string;
  status?: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  slug?: string;
  excerpt?: string;
  categories?: number[];
  tags?: number[];
  featured_media?: number;
  comment_status?: 'open' | 'closed';
  ping_status?: 'open' | 'closed';
  format?: string;
  meta?: Record<string, any>;
}

export interface UpdatePostParams {
  id: number;
  title?: string;
  content?: string;
  status?: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  slug?: string;
  excerpt?: string;
  categories?: number[];
  tags?: number[];
  featured_media?: number;
  comment_status?: 'open' | 'closed';
  meta?: Record<string, any>;
}

export interface CreatePageParams {
  title: string;
  content: string;
  status?: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  slug?: string;
  parent?: number;
  menu_order?: number;
  meta?: Record<string, any>;
}

export interface UpdatePageParams {
  id: number;
  title?: string;
  content?: string;
  status?: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  slug?: string;
  parent?: number;
  menu_order?: number;
  meta?: Record<string, any>;
}

export interface PluginActionParams {
  plugin: string; // Plugin slug or plugin file path e.g. "woocommerce/woocommerce.php"
  status?: 'active' | 'inactive';
}

export interface InstallPluginParams {
  slug: string; // WordPress.org plugin slug or URL to ZIP file
}

export interface UpdateSettingsParams {
  title?: string;
  description?: string;
  url?: string;
  email?: string;
  timezone?: string;
  date_format?: string;
  time_format?: string;
  start_of_week?: number;
  posts_per_page?: number;
  default_category?: number;
  [key: string]: any;
}

export interface CptRequestParams {
  rest_base: string; // e.g., 'portfolio', 'books', 'products'
  action: 'list' | 'get' | 'create' | 'update' | 'delete';
  id?: number;
  data?: Record<string, any>;
  params?: Record<string, any>;
}

export interface RawRequestParams {
  endpoint: string; // Relative path e.g. "/wp-json/wp/v2/posts" or "/wp-json/wc/v3/orders"
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: Record<string, any>;
  data?: Record<string, any>;
  headers?: Record<string, string>;
}
