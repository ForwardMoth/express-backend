import jwt from 'jsonwebtoken'
import {Request, Response} from "express";
import { jwtOptions } from '../../middleware/passport'
import AuthService from '../../services/auth/Auth'

class AuthController {
    private authService: AuthService

    constructor() {
        this.authService = new AuthService()
    }

    register = async (request: any, response: any) => {
        try {
            const admin = await this.authService.getByEmail(request.body.email);

            if (admin) {
              response.status(400).send({ "error": "admin with specified email already exists" })
            }
        }

        catch (error: any) {
            try {
                const admin = await this.authService.create(request.body)
                response.status(201).send(admin)
            } catch (error: any) {
                response.status(400).send({ "error": error.message })
            }
        }
    }

    login = async (request: any, response: any) => {
        const { body } = request

        const { email, password } = body

        try {

            const { admin, checkPassword } = await this.authService.checkPassword(email, password)

            if (checkPassword) {
                const payload = { id: admin.id }

                const accessToken = jwt.sign(payload, jwtOptions.secretOrKey)

                response.send({ accessToken })
            } else {
                throw new Error('Invalid credentials')
            }
        } catch (e: any) {
            response.status(401).send({ "error": e.message })
        }
    }

    me = async (request: Request, response: Response) => {
        try {
            response.send({"user": request.user, "msg": "ok" })
        } catch (e:any) {
            return response.status(404).json({"error": e.message})
        }
    }

    validateToken = async (request: any, response: any) => {
        const {body} = request
        const {accessToken} = body
        try {
            const payload = jwt.verify(accessToken, jwtOptions.secretOrKey)
            // @ts-ignore
            const user = await this.authService.get(payload.id)
            response.send({'valid': true, 'user': user})
        } catch (e: any) {
            response.status(401).send({'valid': false})
        }
}

}

export default AuthController