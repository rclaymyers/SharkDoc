export const Queries = {
  CreateMarkdownDocumentsTableIfNotExists: `
  CREATE TABLE IF NOT EXISTS markdownDocuments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL
  )
  `,
  CreatePagesTableIfNotExists: `
  CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    markdown_document_id INTEGER NOT NULL,
    FOREIGN KEY (markdown_document_id) REFERENCES markdownDocuments(id) ON DELETE CASCADE
  )
  `,
  CreateImagesTableIfNotExists: `
  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    gallery_id INTEGER NOT NULL,
    FOREIGN KEY (gallery_id) REFERENCES galleries(id) ON DELETE CASCADE
  )`,
  CreateGalleriesTableIfNotExists: `
  CREATE TABLE IF NOT EXISTS galleries (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    markdown_document_id INTEGER NOT NULL,
    FOREIGN KEY (markdown_document_id) REFERENCES markdownDocuments(id) ON DELETE CASCADE
  );`,
  CreateMarkdownDocument: `INSERT INTO markdownDocuments (title) VALUES (?)`,
  UpdateMarkdownDocument: `UPDATE markdownDocuments SET title = ? where id = ?`,
  SelectAllMarkdownDocuments: `SELECT * FROM markdownDocuments`,
  SelectMarkdownDocumentById: `Select id, title FROM markdownDocuments WHERE id = ?`,
  CreateGallery: `INSERT INTO galleries (name, markdown_document_id) VALUES (?, ?)`,
  UpdateGallery: `UPDATE galleries SET name = ? WHERE id = ?`,
  CreatePage: `INSERT INTO pages (content, markdown_document_id) VALUES (?, ?)`,
  UpdatePage: `UPDATE pages SET content = ? where id = ?`,
  SelectGalleryById: `SELECT id, name FROM galleries WHERE id = ?`,
  SelectGalleriesByMarkdownDocumentId: `SELECT id, name FROM galleries WHERE markdown_document_id = ?`,
  SelectPagesByMarkdownDocumentId: `SELECT id, content FROM pages WHERE markdown_document_id = ?`,
  SelectPageByPageId: `SELECT id, content FROM pages WHERE id = ?`,
  SelectImagesByGalleryId: `SELECT filename FROM images where gallery_id = ?`,
  InsertImage: `INSERT INTO images (filename, gallery_id) VALUES (?, ?)`,
};
