import { registerUser, loginUser, updateUserService, getUserService, forgotPasswordService, resetPasswordService } from '../services/authService.js'

export async function getMe(req, res, next) {
  try {
    const user = await getUserService(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const result = await updateUserService(req.user.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    await forgotPasswordService(req.body.email);
    res.json({ message: 'If an account exists, a reset link has been sent' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    await resetPasswordService(req.params.token, req.body.password);
    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    next(err);
  }
}
