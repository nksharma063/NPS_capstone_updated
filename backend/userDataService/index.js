const express = require('express')
const swaggerUi = require('swagger-ui-express');
const cookieParser = require('cookie-parser');
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cookieParser());
app.use(express.json())
app.use(cors())

const verifyToken = require('./utils/jwt.middleware');

const healthRoutes = require('./routes/health.route')
const studentRoutes = require('./routes/student.route')
const lrmRoutes = require('./routes/lrm.route')

app.use('/user/health', healthRoutes)
app.use('/user/student',studentRoutes)
app.use('/user/lrm', lrmRoutes)

const swaggerSpec = require('./utils/swaggerConfig')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.listen(process.env.PORT, () => {
    console.log(`userDataService service running at port ${process.env.PORT}`)
})