import {
    getUser,
    updateUser,
    deleteUser,
    followUser,
    UnFollowUser,
  } from '../src/controllers/userController'; 
  import UserModel from '../src/models/UserModel'; 
  import bcrypt from 'bcrypt';
  
  jest.mock('../src/models/UserModel');
  jest.mock('bcrypt');
  
  describe('User Controller', () => {
    let req, res;
  
    beforeEach(() => {
      req = {
        params: {
          id: '',
        },
        body: {},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    describe('getUser', () => {
      it('should return 200 and user details if user exists', async () => {
        req.params.id = '12345';
        const mockUser = { _doc: { name: 'John', password: 'hashedPassword' } };
        UserModel.findById.mockResolvedValue(mockUser);
  
        await getUser(req, res);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ name: 'John' });
      });
  
      it('should return 404 if user does not exist', async () => {
        req.params.id = '12345';
        UserModel.findById.mockResolvedValue(null);
  
        await getUser(req, res);
  
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith("No such user exists");
      });
  
      it('should return 500 if there is a server error', async () => {
        req.params.id = '12345';
        UserModel.findById.mockRejectedValue(new Error('Database error'));
  
        await getUser(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(new Error('Database error'));
      });
    });
  
    describe('updateUser', () => {
      it('should update the user and return 200 if current user is updating their profile', async () => {
        req.params.id = '12345';
        req.body = {
          currentUserId: '12345',
          currentUserAdminStatus: false,
          password: 'newPassword',
        };
  
        const mockUser = { _doc: { _id: '12345' }, save: jest.fn() };
        UserModel.findByIdAndUpdate.mockResolvedValue(mockUser);
        bcrypt.hash.mockResolvedValue('hashedPassword');
  
        await updateUser(req, res);
  
        expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', expect.anything());
        expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith('12345', expect.anything(), { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUser);
      });
  
      it('should return 403 if user tries to update another user', async () => {
        req.params.id = '12345';
        req.body = {
          currentUserId: '67890',
          currentUserAdminStatus: false,
        };
  
        await updateUser(req, res);
  
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith("Access Denied! you can only update your own profile");
      });
  
      it('should return 500 if there is a server error', async () => {
        req.params.id = '12345';
        req.body = {
          currentUserId: '12345',
          currentUserAdminStatus: false,
        };
        
        UserModel.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));
  
        await updateUser(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(new Error('Database error'));
      });
    });
  
    describe('deleteUser', () => {
      it('should delete the user and return 200 if current user is deleting their profile', async () => {
        req.params.id = '12345';
        req.body = {
          currentUserId: '12345',
          currentUserAdminStatus: false,
        };
  
        await deleteUser(req, res);
  
        expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith('12345');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith("User deleted successfully");
      });
  
      it('should return 403 if user tries to delete another user', async () => {
        req.params.id = '12345';
        req.body = {
          currentUserId: '67890',
          currentUserAdminStatus: false,
        };
  
        await deleteUser(req, res);
  
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith("Access Denied! you can only delete your own profile");
      });
  
      it('should return 500 if there is a server error', async () => {
        req.params.id = '12345';
        req.body = {
          currentUserId: '12345',
          currentUserAdminStatus: false,
        };
        
        UserModel.findByIdAndDelete.mockRejectedValue(new Error('Database error'));
  
        await deleteUser(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(new Error('Database error'));
      });
    });
  
    describe('followUser', () => {
      it('should return 403 if user tries to follow themselves', async () => {
        req.params.id = '12345';
        req.body = {
          currentUserId: '12345',
        };
  
        await followUser(req, res);
  
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith("Action forbidden");
      });
  
      it('should follow the user and return 200 if successful', async () => {
        req.params.id = '67890';
        req.body = {
          currentUserId: '12345',
        };
  
        const followUser = { followers: [] };
        const followingUser = { following: [] };
  
        UserModel.findById.mockImplementation((id) => {
          if (id === req.params.id) return Promise.resolve(followUser);
          if (id === req.body.currentUserId) return Promise.resolve(followingUser);
        });
  
        await followUser(req, res);
  
        expect(followUser.followers).toContain(req.body.currentUserId);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith("User followed!");
      });
  
      it('should return 403 if user is already following', async () => {
        req.params.id = '67890';
        req.body = {
          currentUserId: '12345',
        };
  
        const followUser = { followers: ['12345'] };
        const followingUser = { following: [] };
  
        UserModel.findById.mockImplementation((id) => {
          if (id === req.params.id) return Promise.resolve(followUser);
          if (id === req.body.currentUserId) return Promise.resolve(followingUser);
        });
  
        await followUser(req, res);
  
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith("User is Already followed by you");
      });
  
      it('should return 500 if there is a server error', async () => {
        req.params.id = '67890';
        req.body = {
          currentUserId: '12345',
        };
  
        UserModel.findById.mockRejectedValue(new Error('Database error'));
  
        await followUser(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(new Error('Database error'));
      });
    });
  
    describe('unfollowUser', () => {
      it('should return 403 if user tries to unfollow themselves', async () => {
        req.params.id = '12345';
        req.body = {
          currentUserId: '12345',
        };
  
        await UnFollowUser(req, res);
  
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith("Action forbidden");
      });
  
      it('should unfollow the user and return 200 if successful', async () => {
        req.params.id = '67890';
        req.body = {
          currentUserId: '12345',
        };
  
        const followUser = { followers: ['12345'] };
        const followingUser = { following: ['67890'] };
  
        UserModel.findById.mockImplementation((id) => {
          if (id === req.params.id) return Promise.resolve(followUser);
          if (id === req.body.currentUserId) return Promise.resolve(followingUser);
        });
  
        await UnFollowUser(req, res);
  
        expect(followUser.followers).not.toContain(req.body.currentUserId);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith("User Unfollowed!");
      });
  
      it('should return 403 if user is not following', async () => {
        req.params.id = '67890';
        req.body = {
          currentUserId: '12345',
        };
  
        const followUser = { followers: [] };
        const followingUser = { following: ['67890'] };
  
        UserModel.findById.mockImplementation((id) => {
          if (id === req.params.id) return Promise.resolve(followUser);
          if (id === req.body.currentUserId) return Promise.resolve(followingUser);
        });
  
        await UnFollowUser(req, res);
  
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith("You do not follow this user");
      });
  
      it('should return 500 if there is a server error', async () => {
        req.params.id = '67890';
        req.body = {
          currentUserId: '12345',
        };
  
        UserModel.findById.mockRejectedValue(new Error('Database error'));
  
        await UnFollowUser(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(new Error('Database error'));
      });
    });
  });
  