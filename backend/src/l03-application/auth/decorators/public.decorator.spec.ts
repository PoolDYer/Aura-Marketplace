import { Public, IS_PUBLIC_KEY } from './public.decorator';

describe('Public decorator', () => {
  it('should set metadata isPublic to true on decorated method', () => {
    class TestController {
      @Public()
      publicEndpoint() {}
      
      nonPublicEndpoint() {}
    }

    const controller = new TestController();
    const metadataVal = Reflect.getMetadata(IS_PUBLIC_KEY, controller.publicEndpoint);
    expect(metadataVal).toBe(true);

    const nonMetadataVal = Reflect.getMetadata(IS_PUBLIC_KEY, controller.nonPublicEndpoint);
    expect(nonMetadataVal).toBeUndefined();
  });
});
