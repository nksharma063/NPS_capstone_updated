const express = require('express')
const swaggerUi = require('swagger-ui-express');
const cookieParser = require('cookie-parser');
require('dotenv').config()

const app = express()

const cors = require('cors')


app.use(cors())

app.use(cookieParser());
app.use(express.json())

const verifyToken = require('./utils/jwt.middleware');

const healthRoutes = require('./routes/health.route')
const calculateRoutes = require('./routes/calculate.route')

app.use('/calculation/health', healthRoutes)
app.use('/calculation/stat', calculateRoutes)


// For authenticated routes:
// app.use('/questionType', questionTypeRoute, verifyToken)

const swaggerSpec = require('./utils/swaggerConfig')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.listen(process.env.PORT, () => {
    console.log(`NPS Calculation service running at port ${process.env.PORT}`)
})