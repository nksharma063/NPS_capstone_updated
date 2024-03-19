const express = require('express')
const swaggerUi = require('swagger-ui-express');
const cookieParser = require('cookie-parser');
const cors = require("cors")
require('dotenv').config()

const app = express()

app.use(cookieParser());
app.use(express.json())
app.use(cors())

const verifyToken = require('./utils/jwt.middleware');
const questionTypeRoute = require('./routes/questionType.route')
const healthRoutes = require('./routes/health.route')
const questionRoutes = require('./routes/questions.route')
const npsformRoutes = require('./routes/npsform.route')
const npsResponseRoutes = require('./routes/npsresponse.route')

app.use('/nps/questiontypes',questionTypeRoute)
app.use('/nps/health', healthRoutes)
app.use('/nps/questions', questionRoutes)
app.use('/nps/npsform', npsformRoutes)
app.use('/nps/npsresponse',npsResponseRoutes)


// For authenticated routes:
// app.use('/questionType', questionTypeRoute, verifyToken)

const swaggerSpec = require('./utils/swaggerConfig')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.listen(process.env.PORT, () => {
    console.log(`NPS service running at port ${process.env.PORT}`)
})