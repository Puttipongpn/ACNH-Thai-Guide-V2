export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type HealthStatus = {
  api: string;
  database: string;
};

export type AdminUser = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
};

export type LoginResponse = {
  token: string;
  expires_at: string;
  user: AdminUser;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type CategoryInput = {
  name: string;
  slug: string;
  description: string;
  display_order: number;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type TagInput = {
  name: string;
  slug: string;
  description: string;
};

export type PostStatus = 'draft' | 'published';

export type Post = {
  id: string;
  title: string;
  slug: string;
  description: string;
  source_url: string;
  status: PostStatus;
  category_id: string;
  category: Category;
  tags: Tag[];
  created_at: string;
  updated_at: string;
};

export type PostInput = {
  title: string;
  slug: string;
  description: string;
  source_url: string;
  status: PostStatus;
  category_id: string;
  tag_ids: string[];
};
