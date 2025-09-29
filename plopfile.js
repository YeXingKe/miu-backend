const { plural, singular } = require('pluralize')
const { camelCase, pascalCase, kebabCase, constantCase } = require('change-case')

module.exports = function (plop) {
  // 设置辅助函数
  plop.setHelper('camelCase', text => camelCase(text))
  plop.setHelper('pascalCase', text => pascalCase(text))
  plop.setHelper('kebabCase', text => kebabCase(text))
  plop.setHelper('constantCase', text => constantCase(text))
  plop.setHelper('plural', text => plural(text))
  plop.setHelper('singular', text => singular(text))

  plop.setHelper('pascalSingular', text => pascalCase(singular(text)))
  plop.setHelper('pascalPlural', text => pascalCase(plural(text)))
  plop.setHelper('camelSingular', text => camelCase(singular(text)))
  plop.setHelper('camelPlural', text => camelCase(plural(text)))
  plop.setHelper('kebabSingular', text => kebabCase(singular(text)))
  plop.setHelper('kebabPlural', text => kebabCase(plural(text)))

  // 设置自定义 action 类型
  plop.setActionType('logFileCreation', function (answers, config, plop) {
    console.log('\n📁 正在生成文件...')
    return Promise.resolve('文件生成开始')
  })

  // 主生成器
  plop.setGenerator('nestjs-module', {
    // description: '生成完整的 NestJS 模块 (Schema + Controller + Service + Module + DTOs)',
    prompts: [
      {
        type: 'input',
        name: 'moduleName',
        message: '请输入模块名称 (例如: user, product, category):',
        validate: value => {
          if (!value) {
            return '模块名称不能为空'
          }
          if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(value)) {
            return '模块名称只能包含字母和数字，且以字母开头'
          }
          return true
        }
      },
      {
        type: 'input',
        name: 'basePath',
        message: '请输入生成路径 (相对于 src/):',
        default: 'modules'
      },
      {
        type: 'confirm',
        name: 'generateSwagger',
        message: '是否生成 Swagger 装饰器?',
        default: true
      },
      {
        type: 'confirm',
        name: 'generateCrud',
        message: '是否生成完整的 CRUD 操作?',
        default: true
      },
      {
        type: 'input',
        name: 'schemaName',
        message: 'Schema 类名 (PascalCase):',
        default: answers => pascalCase(singular(answers.moduleName))
      },
      {
        type: 'input',
        name: 'controllerName',
        message: 'Controller 类名 (PascalCase):',
        default: answers => `${pascalCase(plural(answers.moduleName))}Controller`
      },
      {
        type: 'input',
        name: 'serviceName',
        message: 'Service 类名 (PascalCase):',
        default: answers => `${pascalCase(plural(answers.moduleName))}Service`
      },
      {
        type: 'input',
        name: 'dtoName',
        message: 'DTO 基础类名 (PascalCase):',
        default: answers => `${pascalCase(singular(answers.moduleName))}Dto`
      },
      {
        type: 'confirm',
        name: 'addTimestamps',
        message: '是否在 Schema 中添加时间戳 (createdAt, updatedAt)?',
        default: true
      },
      {
        type: 'confirm',
        name: 'addSoftDelete',
        message: '是否添加软删除功能?',
        default: false
      }
    ],
    actions: answers => {
      if (!answers) return []

      const {
        moduleName,
        basePath,
        schemaName,
        controllerName,
        serviceName,
        dtoName,
        generateSwagger,
        generateCrud,
        addTimestamps,
        addSoftDelete
      } = answers

      // 计算各种命名格式
      const pascalSingular = pascalCase(singular(moduleName))
      const pascalPlural = pascalCase(plural(moduleName))
      const camelSingular = camelCase(singular(moduleName))
      const camelPlural = camelCase(plural(moduleName))
      const kebabSingular = kebabCase(singular(moduleName))
      const kebabPlural = kebabCase(plural(moduleName))

      return [
        {
          type: 'logFileCreation'
        },
        // Schema 文件
        {
          type: 'add',
          path: `src/${basePath}/{{kebabCase moduleName}}/schemas/{{kebabCase moduleName}}.schema.ts`,
          templateFile: 'plop-templates/schema.hbs',
          data: {
            schemaName,
            pascalSingular,
            camelSingular,
            generateSwagger,
            addTimestamps,
            addSoftDelete
          }
        },
        // Controller 文件
        {
          type: 'add',
          path: `src/${basePath}/{{kebabCase moduleName}}/{{kebabCase moduleName}}.controller.ts`,
          templateFile: 'plop-templates/controller.hbs',
          data: {
            controllerName,
            serviceName,
            dtoName,
            pascalSingular,
            pascalPlural,
            camelSingular,
            camelPlural,
            kebabSingular,
            kebabPlural,
            generateSwagger,
            generateCrud
          }
        },
        // Service 文件
        {
          type: 'add',
          path: `src/${basePath}/{{kebabCase moduleName}}/{{kebabCase moduleName}}.service.ts`,
          templateFile: 'plop-templates/service.hbs',
          data: {
            serviceName,
            schemaName,
            pascalSingular,
            pascalPlural,
            camelSingular,
            camelPlural,
            generateCrud,
            addSoftDelete
          }
        },
        // Module 文件
        {
          type: 'add',
          path: `src/${basePath}/{{kebabCase moduleName}}/{{kebabCase moduleName}}.module.ts`,
          templateFile: 'plop-templates/module.hbs',
          data: {
            moduleName: pascalPlural,
            controllerName,
            serviceName,
            schemaName,
            kebabModuleName: kebabCase(moduleName)
          }
        },
        // Create DTO 文件
        {
          type: 'add',
          path: `src/${basePath}/{{kebabCase moduleName}}/dto/create-{{kebabCase moduleName}}.dto.ts`,
          templateFile: 'plop-templates/create-dto.hbs',
          data: {
            dtoName,
            pascalSingular,
            camelSingular,
            generateSwagger
          }
        },
        // Update DTO 文件
        {
          type: 'add',
          path: `src/${basePath}/{{kebabCase moduleName}}/dto/update-{{kebabCase moduleName}}.dto.ts`,
          templateFile: 'plop-templates/update-dto.hbs',
          data: {
            dtoName,
            pascalSingular,
            kebabSingular
          }
        }
        // Index 文件
        // {
        //   type: 'add',
        //   path: `src/${basePath}/{{kebabCase moduleName}}/index.ts`,
        //   templateFile: 'plop-templates/index.hbs',
        //   data: {
        //     kebabModuleName: kebabCase(moduleName)
        //   }
        // }
      ]
    }
  })

  // 快速 CRUD 生成器
  plop.setGenerator('nestjs-crud', {
    description: '快速生成简单的 CRUD 模块',
    prompts: [
      {
        type: 'input',
        name: 'moduleName',
        message: '请输入模块名称:',
        validate: value => {
          if (!value) return '模块名称不能为空'
          return true
        }
      },
      {
        type: 'input',
        name: 'basePath',
        message: '生成路径:',
        default: 'modules'
      }
    ],
    actions: answers => {
      if (!answers) return []

      const { moduleName, basePath } = answers

      // 计算各种命名格式
      const pascalSingular = pascalCase(singular(moduleName))
      const pascalPlural = pascalCase(plural(moduleName))
      const camelSingular = camelCase(singular(moduleName))
      const camelPlural = camelCase(plural(moduleName))
      const kebabSingular = kebabCase(singular(moduleName))
      const kebabPlural = kebabCase(plural(moduleName))

      return [
        {
          type: 'logFileCreation'
        },
        {
          type: 'add',
          path: `src/${basePath}/{{kebabCase moduleName}}/schemas/{{kebabCase moduleName}}.schema.ts`,
          templateFile: 'plop-templates/simple-schema.hbs',
          data: {
            pascalSingular,
            camelSingular
          }
        },
        {
          type: 'add',
          path: `src/${basePath}/{{kebabCase moduleName}}/{{kebabCase moduleName}}.controller.ts`,
          templateFile: 'plop-templates/simple-controller.hbs',
          data: {
            pascalSingular,
            pascalPlural,
            camelSingular,
            camelPlural,
            kebabPlural
          }
        },
        {
          type: 'add',
          path: `src/${basePath}/{{kebabCase moduleName}}/{{kebabCase moduleName}}.service.ts`,
          templateFile: 'plop-templates/simple-service.hbs',
          data: {
            pascalSingular,
            pascalPlural,
            camelSingular,
            camelPlural
          }
        },
        {
          type: 'add',
          path: `src/${basePath}/{{kebabCase moduleName}}/{{kebabCase moduleName}}.module.ts`,
          templateFile: 'plop-templates/simple-module.hbs',
          data: {
            moduleName: pascalPlural,
            kebabModuleName: kebabCase(moduleName)
          }
        },
        {
          type: 'add',
          path: `src/${basePath}/{{kebabCase moduleName}}/dto/create-{{kebabCase moduleName}}.dto.ts`,
          templateFile: 'plop-templates/simple-create-dto.hbs',
          data: {
            pascalSingular,
            camelSingular
          }
        },
        {
          type: 'add',
          path: `src/${basePath}/{{kebabCase moduleName}}/dto/update-{{kebabCase moduleName}}.dto.ts`,
          templateFile: 'plop-templates/simple-update-dto.hbs',
          data: {
            pascalSingular,
            kebabSingular
          }
        }
      ]
    }
  })
}
