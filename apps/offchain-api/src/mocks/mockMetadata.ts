import type { GenericMetadata, HtmlMetadata, ImageMetadata } from "../types/metadata";

export const mockHtmlMetadata: HtmlMetadata = {
  url: "https://example.com",
  contentType: "text/html",
  title: "Example Website",
  description: "This is an example website for testing purposes",
  favicon: "https://example.com/favicon.ico",
  openGraph: {
    title: "OG Example Title",
    description: "OG Example Description",
    image: "https://example.com/image.jpg",
    url: "https://example.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Twitter Example Title",
    description: "Twitter Example Description",
    image: "https://example.com/image.jpg",
  },
  extractedAt: new Date().toISOString(),
};

export const mockImageMetadata: ImageMetadata = {
  url: "https://example.com/image.jpg",
  contentType: "image/jpeg",
  title: "image.jpg",
  isImage: true,
  dimensions: {
    width: 1200,
    height: 800,
  },
  fileSize: 102400, // 100 KB
  extractedAt: new Date().toISOString(),
};

export const mockPdfMetadata: GenericMetadata = {
  url: "https://example.com/document.pdf",
  contentType: "application/pdf",
  title: "Example PDF Document",
  extractedAt: new Date().toISOString(),
};

export const mockErrorMetadata: HtmlMetadata = {
  url: "https://broken-site.com",
  contentType: "text/html",
  error: "Failed to fetch content: 404 Not Found",
  extractedAt: new Date().toISOString(),
};

// Helper function to get mock metadata by content type
export function getMockMetadataForContentType(contentType: string): any {
  if (contentType.includes("text/html") || contentType.includes("application/xhtml+xml")) {
    return mockHtmlMetadata;
  }
  if (contentType.startsWith("image/")) {
    return mockImageMetadata;
  }
  if (contentType === "application/pdf") {
    return mockPdfMetadata;
  }
  // Return a generic mock with the correct content type
  return {
    ...mockPdfMetadata,
    contentType,
    title: `Mock ${contentType} file`,
  };
}
