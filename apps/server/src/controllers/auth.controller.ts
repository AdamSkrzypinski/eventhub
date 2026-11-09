import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserRepository } from '../repositories/UserRepository.js';

const userRepo = new UserRepository();

const registerSchema = z.object({
  email: z.email('Niepoprawny format adresu e-mail'),
  password: z.string().min(6, 'Hasło musi zawierać co najmniej 6 znaków'),
});

const loginSchema = z.object({
  email: z.email('Niepoprawny format adresu e-mail'),
  password: z.string().min(1, 'Hasło jest wymagane'),
});

export class AuthController {
  public static register(req: Request, res: Response): void {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Błąd walidacji', details: parseResult.error.format() });
      return;
    }

    const { email, password } = parseResult.data;

    const existingUser = userRepo.findByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'Użytkownik o takim adresie e-mail już istnieje' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const newUser = userRepo.create({
      email,
      password_hash,
      role: 'USER',
    });

    res.status(201).json({
      message: 'Użytkownik zarejestrowany pomyślnie',
      user: { id: newUser.id, email: newUser.email, role: newUser.role },
    });
  }

  public static login(req: Request, res: Response): void {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Błąd walidacji', details: parseResult.error.format() });
      return;
    }

    const { email, password } = parseResult.data;

    const user = userRepo.findByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Nieprawidłowy e-mail lub hasło' });
      return;
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Nieprawidłowy e-mail lub hasło' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      message: 'Zalogowano pomyślnie',
      token,
      role: user.role,
    });
  }
}