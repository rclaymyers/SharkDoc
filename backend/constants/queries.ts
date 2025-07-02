const TableNames = {
  markdownDocuments: "markdownDocuments",
  markdownPages: "pages",
  galleryImages: "images",
  galleries: "galleries",
  users: "users",
};

const ColumnNames = {
  markdownDocuments: {
    id: "id",
    title: "title",
    ownerId: "ownerId",
  },
  markdownPages: {
    id: "id",
    content: "content",
    markdownDocumentId: "markdown_document_id",
    ownerId: "ownerId",
  },
  images: {
    id: "id",
    filename: "filename",
    galleryId: "gallery_id",
  },
  galleries: {
    id: "id",
    name: "name",
    markdownDocumentId: "markdown_document_id",
    ownerId: "ownerId",
  },
  users: {
    id: "id",
    username: "username",
    hashedPassword: "hashedPassword",
  },
};

export const UserQueries = {
  CreateUsersTableIfNotExists: `
  CREATE TABLE IF NOT EXISTS ${TableNames.users} (
  ${ColumnNames.users.id} INTEGER PRIMARY KEY AUTOINCREMENT,
  ${ColumnNames.users.username} TEXT NOT NULL,
  ${ColumnNames.users.hashedPassword} TEXT NOT NULL
  )
  `,
  CreateUser: `
  INSERT INTO ${TableNames.users}
  (${ColumnNames.users.username}, ${ColumnNames.users.hashedPassword})
  VALUES (?, ?)
  `,
  SelectUserByUsername: `
  SELECT * FROM ${TableNames.users}
  WHERE ${ColumnNames.users.username} = ?
  `,
};

export const MarkdownDocumentQueries = {
  CreateMarkdownDocumentsTableIfNotExists: `
    CREATE TABLE IF NOT EXISTS ${TableNames.markdownDocuments} (
    ${ColumnNames.markdownDocuments.id} INTEGER PRIMARY KEY AUTOINCREMENT,
    ${ColumnNames.markdownDocuments.title} TEXT NOT NULL,
    ${ColumnNames.markdownDocuments.ownerId} INTEGER NOT NULL,
    FOREIGN KEY (${ColumnNames.markdownDocuments.ownerId})
    REFERENCES ${TableNames.users}(${ColumnNames.users.id}) ON DELETE CASCADE
  )
  `,
  CreateMarkdownDocument: `
    INSERT INTO ${TableNames.markdownDocuments} 
    (${ColumnNames.markdownDocuments.title}, ${ColumnNames.markdownDocuments.ownerId})
    VALUES (?, ?)
    `,
  UpdateMarkdownDocument: `
    UPDATE ${TableNames.markdownDocuments} 
    SET ${ColumnNames.markdownDocuments.title} = ? 
    WHERE ${ColumnNames.markdownDocuments.id} = ?`,
  DeleteMarkdownDocument: `
  DELETE FROM ${TableNames.markdownDocuments}
  WHERE ${ColumnNames.markdownDocuments.id} = ?
  `,
  SelectAllMarkdownDocumentsForUser: `
  SELECT * FROM ${TableNames.markdownDocuments}
  WHERE ${ColumnNames.markdownDocuments.ownerId} = ?
  `,
  SelectMarkdownDocumentById: `
    SELECT ${ColumnNames.markdownDocuments.id}, ${ColumnNames.markdownDocuments.title} 
    FROM ${TableNames.markdownDocuments} 
    WHERE ${ColumnNames.markdownDocuments.id} = ?`,
};

export const MarkdownDocumentPageQueries = {
  CreatePagesTableIfNotExists: `
  CREATE TABLE IF NOT EXISTS ${TableNames.markdownPages} (
    ${ColumnNames.markdownPages.id} INTEGER PRIMARY KEY AUTOINCREMENT,
    ${ColumnNames.markdownPages.content} TEXT NOT NULL,
    ${ColumnNames.markdownPages.markdownDocumentId} INTEGER NOT NULL,
    FOREIGN KEY (${ColumnNames.markdownPages.markdownDocumentId}) 
    REFERENCES ${TableNames.markdownDocuments}(${ColumnNames.markdownDocuments.id}) 
    ON DELETE CASCADE
  )
  `,
  CreatePage: `
    INSERT INTO ${TableNames.markdownPages} 
    (${ColumnNames.markdownPages.content}, ${ColumnNames.markdownPages.markdownDocumentId}) 
    VALUES (?, ?)`,
  UpdatePage: `
    UPDATE ${TableNames.markdownPages} 
    SET ${ColumnNames.markdownPages.content} = ? 
    WHERE ${ColumnNames.markdownPages.id} = ?`,
  SelectPagesByMarkdownDocumentId: `
  SELECT ${ColumnNames.markdownPages.id}, ${ColumnNames.markdownPages.content} 
  FROM ${TableNames.markdownPages} WHERE ${ColumnNames.markdownPages.markdownDocumentId} = ?`,
  SelectPageByPageId: `
  SELECT ${ColumnNames.markdownPages.id}, ${ColumnNames.markdownPages.content} 
  FROM ${TableNames.markdownPages} WHERE ${ColumnNames.markdownPages.id} = ?`,
  DeletePageByPageId: `
  DELETE FROM ${TableNames.markdownPages}
  WHERE ${ColumnNames.markdownPages.id} = ?
  `,
};

export const GalleryQueries = {
  CreateGalleriesTableIfNotExists: `
    CREATE TABLE IF NOT EXISTS ${TableNames.galleries} (
    ${ColumnNames.galleries.id} INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    ${ColumnNames.galleries.name} TEXT NOT NULL,
    ${ColumnNames.galleries.markdownDocumentId} INTEGER NOT NULL,
    FOREIGN KEY (${ColumnNames.galleries.markdownDocumentId}) 
    REFERENCES ${TableNames.markdownDocuments}(${ColumnNames.markdownDocuments.id}) ON DELETE CASCADE
  )`,
  CreateGallery: `
    INSERT INTO ${TableNames.galleries} 
    (${ColumnNames.galleries.name}, ${ColumnNames.galleries.markdownDocumentId}) 
    VALUES (?, ?)`,
  DeleteGallery: `
    DELETE FROM ${TableNames.galleries}
    WHERE ${ColumnNames.galleries.id} = ?
  `,
  UpdateGallery: `
    UPDATE ${TableNames.galleries} 
    SET ${ColumnNames.galleries.name} = ? 
    WHERE ${ColumnNames.galleries.id} = ?`,
  SelectGalleryById: `
  SELECT ${ColumnNames.galleries.id}, ${ColumnNames.galleries.name} 
  FROM ${TableNames.galleries} WHERE ${ColumnNames.galleries.id} = ?`,
  SelectGalleriesByMarkdownDocumentId: `
  SELECT ${ColumnNames.galleries.id}, ${ColumnNames.galleries.name} 
  FROM ${TableNames.galleries} WHERE ${ColumnNames.galleries.markdownDocumentId} = ?`,
};

export const ImageQueries = {
  CreateImagesTableIfNotExists: `
    CREATE TABLE IF NOT EXISTS ${TableNames.galleryImages} (
    ${ColumnNames.images.id} INTEGER PRIMARY KEY AUTOINCREMENT,
    ${ColumnNames.images.filename} TEXT NOT NULL,
    ${ColumnNames.images.galleryId} INTEGER NOT NULL,
    FOREIGN KEY (${ColumnNames.images.galleryId}) 
    REFERENCES ${TableNames.galleries}(${ColumnNames.galleries.id}) ON DELETE CASCADE
  )`,
  SelectImagesByGalleryId: `
  SELECT ${ColumnNames.images.filename} 
  FROM ${TableNames.galleryImages} WHERE ${ColumnNames.images.galleryId} = ?`,
  InsertImage: `
  INSERT INTO ${TableNames.galleryImages}
  (${ColumnNames.images.filename}, ${ColumnNames.images.galleryId}) VALUES (?, ?)`,
  DeleteImage: `
  DELETE FROM ${TableNames.galleryImages}
  WHERE ${ColumnNames.images.filename} = ?
  `,
};
