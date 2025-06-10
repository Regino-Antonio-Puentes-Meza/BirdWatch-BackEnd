import * as userController from '../../controllers/userController.js';
import UserModel from '../../models/UserModel.js';
import messages from '../../utils/messages.js';
import bcrypt from 'bcrypt';

jest.mock('../../models/UserModel.js');
jest.mock('bcrypt');
jest.mock('../../config/dbConnect.js', () => jest.fn());

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: 'user123' }, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getUser', () => {
    it('debe devolver los datos del usuario sin contraseña', async () => {
      UserModel.findById.mockResolvedValue({ _doc: { nombre: 'Juan', password: 'secret' } });

      await userController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ nombre: 'Juan' });
    });

    it('debe manejar usuario no encontrado', async () => {
      UserModel.findById.mockResolvedValue(null);

      await userController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: messages.USER.USER_NOT_FOUND });
    });
  });

  describe('updateUser', () => {
    it('debe actualizar el usuario si es el mismo o admin', async () => {
      req.body = {
        currentUserId: 'user123',
        currentUserAdminStatus: false,
        password: '1234'
      };
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPass');
      UserModel.findByIdAndUpdate.mockResolvedValue({ nombre: 'Juan Actualizado' });

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ nombre: 'Juan Actualizado' });
    });

    it('debe denegar el acceso si el usuario no es el mismo ni admin', async () => {
      req.body = {
        currentUserId: 'otroId',
        currentUserAdminStatus: false
      };

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: messages.AUTH.ACCESS_DENIED_UPDATE_PROFILE });
    });
  });

  describe('deleteUser', () => {
    it('debe eliminar el usuario si es el mismo o admin', async () => {
      req.body = { currentUserId: 'user123', currentUserAdminStatus: false };
      UserModel.findByIdAndDelete.mockResolvedValue({});

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ error: messages.USER.USER_DELETED });
    });

    it('debe denegar la eliminación si no tiene permisos', async () => {
      req.body = { currentUserId: 'otroId', currentUserAdminStatus: false };

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: messages.AUTH.ACCESS_DENIED_UPDATE_PROFILE });
    });
  });

  describe('followUser', () => {
    it('debe permitir seguir a otro usuario', async () => {
      req.body.currentUserId = 'user123';
      req.params.id = 'user456';

      const followUser = { followers: [], updateOne: jest.fn() };
      const followingUser = { updateOne: jest.fn() };

      UserModel.findById
        .mockResolvedValueOnce(followUser)
        .mockResolvedValueOnce(followingUser);

      await userController.followUser(req, res);

      expect(followUser.updateOne).toHaveBeenCalled();
      expect(followingUser.updateOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(messages.USER.USER_FOLLOWED);
    });

    it('debe rechazar si ya lo sigue', async () => {
      req.body.currentUserId = 'user123';
      req.params.id = 'user456';

      const followUser = { followers: ['user123'] };
      UserModel.findById.mockResolvedValue(followUser);

      await userController.followUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(messages.USER.USER_ALREADY_FOLLOWED);
    });

    it('debe rechazar si intenta seguirse a sí mismo', async () => {
      req.body.currentUserId = 'user123';
      req.params.id = 'user123';

      await userController.followUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(messages.USER.ACTION_FORBIDDEN);
    });
  });

  describe('UnFollowUser', () => {
    it('debe dejar de seguir a otro usuario', async () => {
      req.body.currentUserId = 'user123';
      req.params.id = 'user456';

      const followUser = { followers: ['user123'], updateOne: jest.fn() };
      const followingUser = { updateOne: jest.fn() };

      UserModel.findById
        .mockResolvedValueOnce(followUser)
        .mockResolvedValueOnce(followingUser);

      await userController.UnFollowUser(req, res);

      expect(followUser.updateOne).toHaveBeenCalled();
      expect(followingUser.updateOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(messages.USER.USER_UNFOLLOWED);
    });

    it('debe rechazar si no lo seguía', async () => {
      req.body.currentUserId = 'user123';
      req.params.id = 'user456';

      const followUser = { followers: [] };
      UserModel.findById.mockResolvedValue(followUser);

      await userController.UnFollowUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(messages.USER.USER_IS_NOT_FOLLOWED);
    });

    it('debe rechazar si intenta dejar de seguirse a sí mismo', async () => {
      req.body.currentUserId = 'user123';
      req.params.id = 'user123';

      await userController.UnFollowUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(messages.USER.ACTION_FORBIDDEN);
    });
  });
});
