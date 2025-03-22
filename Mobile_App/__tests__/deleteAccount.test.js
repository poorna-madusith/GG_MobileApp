import { deleteAccount } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('axios');

describe('deleteAccount', () => {
  beforeEach(() => {
    AsyncStorage.getItem.mockClear();
    AsyncStorage.multiRemove.mockClear();
    axios.delete.mockClear();
  });

  it('should successfully delete account', async () => {
    AsyncStorage.getItem.mockResolvedValue('test-token');
    axios.delete.mockResolvedValue({ 
      data: { success: true, message: 'Account deleted successfully' }
    });

    const result = await deleteAccount();

    expect(result.success).toBe(true);
    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['auth_token', 'user_data']);
  });

  it('should handle deletion failure', async () => {
    AsyncStorage.getItem.mockResolvedValue('test-token');
    axios.delete.mockRejectedValue({
      response: { data: { message: 'Deletion failed' } }
    });

    const result = await deleteAccount();

    expect(result.success).toBe(false);
    expect(result.message).toBe('Deletion failed');
  });
});