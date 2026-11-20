import fs from 'node:fs'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import multer from 'multer'

const filmImageDirectory = fileURLToPath(new URL('../uploads/films/', import.meta.url))
const allowedImageTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
])

fs.mkdirSync(filmImageDirectory, { recursive: true })

const upload = multer({
  storage: multer.diskStorage({
    destination(_req, _file, callback) {
      callback(null, filmImageDirectory)
    },
    filename(_req, file, callback) {
      callback(null, randomUUID() + allowedImageTypes.get(file.mimetype))
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter(_req, file, callback) {
    if (!allowedImageTypes.has(file.mimetype)) {
      const error = new Error('Format d’image non accepté. Utilisez JPG, PNG ou WEBP.')
      error.code = 'INVALID_IMAGE_TYPE'
      callback(error)
      return
    }

    callback(null, true)
  },
})

function uploadFilmImage(req, res, next) {
  upload.single('image')(req, res, (error) => {
    if (!error) {
      next()
      return
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'L’image ne doit pas dépasser 5 Mo.' })
      return
    }

    if (error.code === 'INVALID_IMAGE_TYPE') {
      res.status(400).json({ error: error.message })
      return
    }

    if (error instanceof multer.MulterError) {
      res.status(400).json({ error: 'Le téléversement de l’image a échoué.' })
      return
    }

    console.error(error)
    res.status(500).json({ error: 'Le téléversement de l’image a échoué.' })
  })
}

export default uploadFilmImage
