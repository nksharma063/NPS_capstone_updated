const express = require('express')
const app = express()
require('dotenv').config()
const swaggerUi = require('swagger-ui-express');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const cors = require('cors')


app.use(cors())

app.use(express.json())
const healthRoutes = require('./routes/health.route')
const domainRoutes = require('./routes/domain.route')
const batchRoutes = require('./routes/batch.route')
const programRoutes = require('./routes/program.route')

const verifyToken = require('./utils/jwt.middleware');

// The bottom codes will make protected routes
// app.use('/health', verifyToken, healthRoutes)
// app.use('/domain', verifyToken, domainRoutes)
// app.use('/batch', verifyToken, batchRoutes)
// app.use('/program', verifyToken, programRoutes)

app.use('/base/health', healthRoutes)
app.use('/base/domain', domainRoutes)
app.use('/base/batch', batchRoutes)
app.use('/base/program', programRoutes)

const swaggerSpec = require('./utils/swaggerConfig')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(process.env.PORT, ()=>{
    console.log(`Base Service running at port ${process.env.PORT}`)
})