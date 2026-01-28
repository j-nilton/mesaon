import { FirebaseAuthService } from '../infra/services/firebase/FirebaseAuthService'
import { LoginUseCase } from '../usecase/LoginUseCase'
import { RegisterUseCase } from '../usecase/RegisterUseCase'
import { AccessCodeServiceFirebase } from '../infra/services/firebase/AccessCodeServiceFirebase'
import { GenerateAccessCodeUseCase } from '../usecase/GenerateAccessCodeUseCase'
import { ValidateAccessCodeUseCase } from '../usecase/ValidateAccessCodeUseCase'
import { SetUserRoleUseCase } from '../usecase/SetUserRoleUseCase'
import { GetCurrentUserProfileUseCase } from '../usecase/GetCurrentUserProfileUseCase'
import { GetCodeHistoryUseCase } from '../usecase/GetCodeHistoryUseCase'
import { DeleteAccessCodeUseCase } from '../usecase/DeleteAccessCodeUseCase'
import { ProductServiceFirebase } from '../infra/services/firebase/ProductServiceFirebase'
import { ListProductsByCodeUseCase } from '../usecase/ListProductsByCodeUseCase'
import { CreateProductUseCase } from '../usecase/CreateProductUseCase'
import { UpdateProductUseCase } from '../usecase/UpdateProductUseCase'
import { DeleteProductUseCase } from '../usecase/DeleteProductUseCase'
import { TableServiceFirebase } from '../infra/services/firebase/TableServiceFirebase'
import { ListTablesByCodeUseCase } from '../usecase/ListTablesByCodeUseCase'
import { CreateTableUseCase } from '../usecase/CreateTableUseCase'
import { GetTableByIdUseCase } from '../usecase/GetTableByIdUseCase'
import { ResendVerificationEmailUseCase } from '../usecase/ResendVerificationEmailUseCase'
import { CheckEmailVerificationUseCase } from '../usecase/CheckEmailVerificationUseCase'
import { UpdateTableUseCase } from '../usecase/UpdateTableUseCase'
import { DeleteTableUseCase } from '../usecase/DeleteTableUseCase'
import { SubscribeTablesByCodeUseCase } from '../usecase/SubscribeTablesByCodeUseCase'
import { RecoverPasswordUseCase } from '../usecase/RecoverPasswordUseCase'
import { AuthService } from '../model/services/AuthService'

import { MockAuthService } from '../infra/services/mock/MockAuthService'
import { MockAccessCodeService } from '../infra/services/mock/MockAccessCodeService'
import { MockProductService } from '../infra/services/mock/MockProductService'
import { MockTableService } from '../infra/services/mock/MockTableService'

// FLAG PARA MOCK (Controlado via variável de ambiente)
// Para usar mocks: EXPO_PUBLIC_USE_MOCK=true
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

// Singleton simples para Injeção de Dependência
class DIContainer {
  private static _authService: AuthService = USE_MOCK ? new MockAuthService() : new FirebaseAuthService()
  private static _accessCodeService = USE_MOCK ? new MockAccessCodeService() : new AccessCodeServiceFirebase()
  private static _productService = USE_MOCK ? new MockProductService() : new ProductServiceFirebase()
  private static _tableService = USE_MOCK ? new MockTableService() : new TableServiceFirebase()

  static getLoginUseCase(): LoginUseCase {
    return new LoginUseCase(this._authService)
  }

  static getRegisterUseCase(): RegisterUseCase {
    return new RegisterUseCase(this._authService);
  }

  static getResendVerificationEmailUseCase(): ResendVerificationEmailUseCase {
    return new ResendVerificationEmailUseCase(this._authService)
  }

  static getCheckEmailVerificationUseCase(): CheckEmailVerificationUseCase {
    return new CheckEmailVerificationUseCase(this._authService)
  }

  static getAuthService(): AuthService {
    return this._authService
  }

  static getGenerateAccessCodeUseCase(): GenerateAccessCodeUseCase {
    return new GenerateAccessCodeUseCase(this._accessCodeService, this._authService)
  }

  static getValidateAccessCodeUseCase(): ValidateAccessCodeUseCase {
    return new ValidateAccessCodeUseCase(this._accessCodeService, this._authService)
  }

  static getSetUserRoleUseCase(): SetUserRoleUseCase {
    return new SetUserRoleUseCase(this._authService)
  }

  static getCurrentUserProfileUseCase(): GetCurrentUserProfileUseCase {
    return new GetCurrentUserProfileUseCase(this._authService)
  }

  static getCodeHistoryUseCase(): GetCodeHistoryUseCase {
    return new GetCodeHistoryUseCase(this._authService)
  }

  static getDeleteAccessCodeUseCase(): DeleteAccessCodeUseCase {
    return new DeleteAccessCodeUseCase(this._accessCodeService)
  }

  static getListProductsByCodeUseCase(): ListProductsByCodeUseCase {
    return new ListProductsByCodeUseCase(this._productService)
  }
  static getCreateProductUseCase(): CreateProductUseCase {
    return new CreateProductUseCase(this._productService, this._authService)
  }
  static getUpdateProductUseCase(): UpdateProductUseCase {
    return new UpdateProductUseCase(this._productService, this._authService)
  }
  static getDeleteProductUseCase(): DeleteProductUseCase {
    return new DeleteProductUseCase(this._productService, this._authService)
  }
  static getListTablesByCodeUseCase(): ListTablesByCodeUseCase {
    return new ListTablesByCodeUseCase(this._tableService)
  }
  static getSubscribeTablesByCodeUseCase(): SubscribeTablesByCodeUseCase {
    return new SubscribeTablesByCodeUseCase(this._tableService)
  }
  static getCreateTableUseCase(): CreateTableUseCase {
    return new CreateTableUseCase(this._tableService, this._authService)
  }
  static getGetTableByIdUseCase(): GetTableByIdUseCase {
    return new GetTableByIdUseCase(this._tableService, this._authService)
  }
  static getUpdateTableUseCase(): UpdateTableUseCase {
    return new UpdateTableUseCase(this._tableService, this._authService)
  }
  static getDeleteTableUseCase(): DeleteTableUseCase {
    return new DeleteTableUseCase(this._tableService, this._authService)
  }
  static getRecoverPasswordUseCase(): RecoverPasswordUseCase {
    return new RecoverPasswordUseCase(this._authService)
  }
}

export const container = DIContainer
