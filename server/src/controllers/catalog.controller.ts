import { Request, Response, NextFunction } from 'express';
import { CatalogService } from '../services/catalog.service';
import { ApiResponse } from '@shopnest/shared';

// --- Categories ---
export const getCategories = async (
  _req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await CatalogService.getCategories();
    res.status(200).json({
      success: true,
      data: categories,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await CatalogService.createCategory(req.body);
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// --- Products ---
export const getProducts = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page,
      limit,
      category,
      search,
      minPrice,
      maxPrice,
      sort,
      availability,
      inStock,
    } = req.query;

    const validatedSort = ['price_asc', 'price_desc', 'newest', 'rating', 'popularity'].includes(
      sort as string
    )
      ? (sort as 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popularity')
      : undefined;

    const validatedAvailability = ['all', 'in_stock', 'out_of_stock'].includes(
      availability as string
    )
      ? (availability as 'all' | 'in_stock' | 'out_of_stock')
      : undefined;

    const result = await CatalogService.getProducts({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      category: category as string,
      search: search as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      availability: validatedAvailability,
      inStock: inStock === 'true' ? true : inStock === 'false' ? false : undefined,
      sort: validatedSort,
    });

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await CatalogService.getProductBySlug(req.params.slug);
    res.status(200).json({
      success: true,
      data: product,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getRelatedProducts = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 4;
    const related = await CatalogService.getRelatedProducts(req.params.slug, limit);
    res.status(200).json({
      success: true,
      data: related,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id.toString();
    const product = await CatalogService.createProduct(req.body, userId);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id.toString();
    const product = await CatalogService.updateProduct(req.params.id, req.body, userId);
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    await CatalogService.deleteProduct(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
