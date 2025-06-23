import React, { act, useRef } from 'react';
import { render, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../src/AuthContext';
import * as api from '../src/api';
import { AxiosResponse, AxiosHeaders } from 'axios';

const mockAxiosResponse: AxiosResponse = {
    data: true,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {
        headers: new AxiosHeaders(),
    },
};

jest.spyOn(api, 'validateToken').mockResolvedValueOnce(mockAxiosResponse);
jest.spyOn(api, 'validateToken').mockRejectedValueOnce(new Error('Invalid token'));

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('初期状態では認証されていない', () => {
        let contextValue: any;
        render(
            <AuthProvider>
                <AuthContext.Consumer>
                    {(value) => {
                        contextValue = value;
                        return null;
                    }}
                </AuthContext.Consumer>
            </AuthProvider>
        );

        expect(contextValue.authToken).toBeNull();
        expect(contextValue.isAuthenticated).toBe(false);
    });


    test('login 関数で認証状態になる', () => {
        let contextValue: any;
        render(
            <AuthProvider>
                <AuthContext.Consumer>
                    {(value) => {
                        contextValue = value;
                        return null;
                    }}
                </AuthContext.Consumer>
            </AuthProvider>
        );

        act(() => {
            contextValue.login('test-token');
        });

        expect(localStorage.getItem('jwt')).toBe('test-token');
        expect(contextValue.authToken).toBe('test-token');
        expect(contextValue.isAuthenticated).toBe(true);
    });

    test('logout 関数で認証状態が解除される', () => {
        let contextValue: any;
        render(
            <AuthProvider>
                <AuthContext.Consumer>
                    {(value) => {
                        contextValue = value;
                        return null;
                    }}
                </AuthContext.Consumer>
            </AuthProvider>
        );

        act(() => {
            contextValue.login('test-token');
            contextValue.logout();
        });

        expect(localStorage.getItem('jwt')).toBeNull();
        expect(contextValue.authToken).toBeNull();
        expect(contextValue.isAuthenticated).toBe(false);
    });

    test('validateToken が成功したら認証状態になる', async () => {
        jest.spyOn(api, 'validateToken').mockResolvedValueOnce(mockAxiosResponse);
        localStorage.setItem('jwt', 'valid-token');

        let contextValue: any;
        render(
            <AuthProvider>
                <AuthContext.Consumer>
                    {(value) => {
                        contextValue = value;
                        return null;
                    }}
                </AuthContext.Consumer>
            </AuthProvider>
        );

        await waitFor(() => {
            expect(contextValue.authToken).toBe('valid-token');
            expect(contextValue.isAuthenticated).toBe(true);
        });
    });


    test('validateToken が失敗したら logout される', async () => {
        localStorage.setItem('jwt', 'invalid-token');

        let contextValue: any = null;

        render(
            <AuthProvider>
                <AuthContext.Consumer>
                    {(value) => {
                        contextValue = value;
                        return null;
                    }}
                </AuthContext.Consumer>
            </AuthProvider>
        );

        await waitFor(() => {
            expect(contextValue).not.toBeNull();
            expect(contextValue.authToken).toBeNull();
            expect(contextValue.isAuthenticated).toBe(false);
        });
    });
});
