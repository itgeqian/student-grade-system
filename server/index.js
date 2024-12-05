import express from 'express'
import multer from 'multer'
import path from 'path'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
app.use(cors())

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })

// 文件上传接口
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    const file = req.file
    res.json({
      code: 200,
      message: '上传成功',
      data: {
        id: Date.now(),
        name: file.originalname,
        url: `http://localhost:3000/uploads/${file.filename}`,
        size: file.size
      }
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '上传失败',
      error: error.message
    })
  }
})

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
}) 