import multer from 'multer'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
const upload = multer({ storage: storage })

export const multerUpload = upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
])

export const multerVideoUpload =  upload.fields([
  {
      name: "videoFile",
      maxCount: 1,
  },
  {
      name: "thumbnail",
      maxCount: 1,
  },
  
])