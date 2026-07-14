import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('returns normalized JWT payload when token is not revoked', async () => {
    const tokenRevocadoRepo = { findByToken: jest.fn().mockResolvedValue(null) };
    const strategy = new JwtStrategy({ get: jest.fn().mockReturnValue('secret') } as any, tokenRevocadoRepo as any);

    await expect(
      strategy.validate({ headers: { authorization: 'Bearer access-token' } }, { sub: 'user-1', email: 'ada@test.dev', rol: 'COMPRADOR' }),
    ).resolves.toEqual({ id: 'user-1', sub: 'user-1', email: 'ada@test.dev', rol: 'COMPRADOR' });
    expect(tokenRevocadoRepo.findByToken).toHaveBeenCalledWith('access-token');
  });

  it('rejects revoked tokens', async () => {
    const tokenRevocadoRepo = { findByToken: jest.fn().mockResolvedValue({ id: 'revoked' }) };
    const strategy = new JwtStrategy({ get: jest.fn().mockReturnValue('secret') } as any, tokenRevocadoRepo as any);

    await expect(strategy.validate({ headers: { authorization: 'Bearer access-token' } }, { sub: 'user-1' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
