const version = 'v1'
const baseURI = '/zh/' + version

const nav = [{
	text: '业务设计',
	link: baseURI + '/product/start/index',
	activeMatch: '^/zh/' + version + '/(product)/'
},
	// {text: '重构中...'},
	{
		text: '使用手册',
		link: baseURI + '/manual/start/index',
		// activeMatch: `^\/zh\/(start)\/(?!qa)`
		activeMatch: '^' + baseURI + '/(manual)/'
	},
	{
		text: '运营方案',
		link: baseURI + '/operation/start/index',
		// activeMatch: `^\/zh\/(start)\/(?!qa)`
		activeMatch: '^' + baseURI + '/(operation)/'
	},
	{
		text: '案例展示',
		link: baseURI + '/case/start/index',
		// activeMatch: `^\/zh\/(start)\/(?!qa)`
		activeMatch: '^' + baseURI + '/(case)/'
	},
	{
		text: '联系我们', link: baseURI + '/contact/qa'
	}, // {
	//     text: 'version',
	//     items: [
	//         {text: 'v1', link: '/bs/v1/zh'},
	//         {text: 'v2', link: '/bs/v2/zh'},
	//     ]
	// }
]


export const sidebar = {
	'/zh/v1/manual': [

		// {text: 'ChatGPT的小程序登录授权', link: baseURI + '/manual/mp/customer/chatgpt'}
		// {text: '重构中...'},
		{
			text: '开始', items: [{text: '概述', link: baseURI + '/manual/start/index'},
				{text: '安装准备', link: baseURI + '/manual/start/installation'},
				{text: '配置信息', link: baseURI + '/manual/start/config'},
				{text: '使用IDE启动', link: baseURI + '/manual/start/installation-ide'},
				{text: '本地命令行启动', link: baseURI + '/manual/start/installation-command'},
				{text: 'docker-compose部署', link: baseURI + '/manual/start/installation-docker-compose'},
				{text: 'k8s部署', link: baseURI + '/manual/start/installation-k8s'},
				// {text: '快速开始', link: baseURI + '/manual/start/quick-start'},
				{text: 'API接口介绍', link: baseURI + '/manual/system/api'},
				{text: '贡献开发介绍', link: baseURI + '/manual/system/criterion'},
				{text: '定制项目参考', link: baseURI + '/manual/system/custom'},
				{text: 'Q&A', link: baseURI + '/manual/system/qa'},

			]
		},

		{
			text: 'CRM', items: [
				{text: '概述', link: baseURI + '/manual/crm/index'},
				{
					text: '系统管理', link: baseURI + '/manual/crm/admin-system/index', items: [
						{text: '员工管理', link: baseURI + '/manual/crm/admin-system/employee-management/index'},
						{
							text: '组织管理', link: baseURI + '/manual/crm/admin-system/organization-management/index',
							collapsible: true, collapsed: true,
							items: [
								{
									text: '部门管理',
									link: baseURI + '/manual/crm/admin-system/organization-management/department-management/index'
								},
							]
						},
						{text: '权限管理', link: baseURI + '/manual/crm/admin-system/permission-management/index'}
					]
				},
				{
					text: '客域', link: baseURI + '/manual/crm/customer-domain/index', items: [
						{text: '线索', link: baseURI + '/manual/crm/customer-domain/lead/index'},
						{text: '客户', link: baseURI + '/manual/crm/customer-domain/customer/index'},
						{text: '小程序客户登录授权', link: baseURI + '/manual/mp/customer/login'},
					]
				},
				{
					text: '产品服务', link: baseURI + '/manual/crm/product-service/index', items: [
						{
							text: '产品', link: baseURI + '/manual/crm/product-service/product/index',
							collapsible: true, collapsed: true,
							items: [
								{text: '商品列表', link: baseURI + '/manual/crm/product-service/product/list'},
								{text: '新增商品', link: baseURI + '/manual/crm/product-service/product/create'},
								{text: '编辑商品', link: baseURI + '/manual/crm/product-service/product/edit'},
								{text: '删除商品', link: baseURI + '/manual/crm/product-service/product/delete'},
							]
						},
						{text: '产品分类', link: baseURI + '/manual/crm/product-service/product-category/index'},
						{
							text: '价格手册', link: baseURI + '/manual/crm/product-service/price-book/index',
							collapsible: true, collapsed: true,
							items: [
								{text: '价格手册列表', link: baseURI + '/manual/crm/product-service/price-book/list'},
								{text: '新增价格手册', link: baseURI + '/manual/crm/product-service/price-book/create'},
								{text: '编辑价格手册', link: baseURI + '/manual/crm/product-service/price-book/edit'},
								{text: '删除价格手册', link: baseURI + '/manual/crm/product-service/price-book/index'},
							]
						},
						{
							text: '配置价格', link: baseURI + '/manual/crm/product-service/price-book-config/index'
						},
						{text: '元匠', link: baseURI + '/manual/crm/product-service/artisan/index'},
					]
				},
				{
					text: '市场营销', link: baseURI + '/manual/crm/marketing', items: [
						{text: '门店管理', link: baseURI + '/manual/crm/marketing/store/index'},
						{text: '媒资', link: baseURI + '/manual/crm/marketing/media/index'},
						{
							text: '营销活动', link: baseURI + '/manual/crm/marketing/campaign/index',
							collapsible: true, collapsed: true,
							items: [
								{text: 'MGM', link: baseURI + '/manual/crm/marketing/campaign/mgm/index'},
							]
						},
						{text: '品牌故事', link: baseURI + '/manual/crm/marketing/brand-story/index'},
					]
				},
				{
					text: '交易', link: baseURI + '/manual/crm/trade/index', items: [
						{text: '订单', link: baseURI + '/manual/crm/trade/order/index'},
						{text: '支付', link: baseURI + '/manual/crm/trade/payment/index'},
						{text: '退款', link: baseURI + '/manual/crm/trade/refund/index'},
						{text: '物流', link: baseURI + '/manual/crm/trade/shipping/index'},
						{text: '仓储', link: baseURI + '/manual/crm/trade/inventory/index'},
					]
				},
				{
					text: '生意', link: baseURI + '/manual/crm/business/index', items: [
						{text: '商机', link: baseURI + '/manual/crm/business/opportunity/index'},
						{text: '报价', link: baseURI + '/manual/crm/business/quotation/index'},
					]
				},
				{
					text: '运营', link: baseURI + '/manual/crm/operation/index', items: [
						{text: '报表', link: baseURI + '/manual/crm/operation/report/index'},
					]
				},
			]
		},

		{
			text: 'SCRM 基础功能', items: [
				{text: '概述', link: baseURI + '/manual/scrm/index'},
				{
					text: '营销获客',
					collapsible: true, collapsed: false,
					items: [
						{text: '渠道活码', link: baseURI + '/manual/scrm/marketing-acquisition/contact-way'},
						{text: '群活码', link: baseURI + '/manual/scrm/marketing-acquisition/group-qr.md'}
					],
				},
				{
					text: '内容管理',
					collapsible: true, collapsed: false,
					items: [
						{text: '话术库', link: baseURI + '/manual/scrm/cms/script-lib'},
						{text: '媒体库', link: baseURI + '/manual/scrm/cms/media'}
					],
				},
				{
					text: '客户运营',
					collapsible: true, collapsed: false,
					items:[
						{text: '客户群发', link: baseURI + '/manual/scrm/operation/group-send'},
						{text: '入群欢迎语', link: baseURI + '/manual/scrm/operation/welcome-script'},
						{text: '企微朋友圈', link: baseURI + '/manual/scrm/operation/moment'},
						{text: '员工群发记录', link: baseURI + '/manual/scrm/operation/employee-group-send-history'}
					],
				},
				{
					text: '客域管理',
					collapsible: true, collapsed: false,
					items:[
						{text: '客户管理', link: baseURI + '/manual/scrm/customer-domaincustomer'},
						{text: '客户详情', link: baseURI + '/manual/scrm/customer-domaintag'},
						{text: '客户标签', link: baseURI + '/manual/scrm/customer-domainmigrate'},
						{text: '客户迁移', link: baseURI + '/manual/scrm/customer-domainblack-list'}
					],
				},
				{
					text: '客户群管理',
					collapsible: true, collapsed: false,
					items:[
						{text: '客户群列表', link: baseURI + '/manual/scrm/customer-group/group'},
						{text: '客户群标签', link: baseURI + '/manual/scrm/customer-group/tag'}
					],
				},
				{
					text: '企业管理',
					collapsible: true, collapsed: false,
					items:[
						{text: '客户群列表', link: baseURI + '/manual/scrm/wechat/organization'},
						{text: '客户群标签', link: baseURI + '/manual/scrm/wechat/group'}
					],
				},
				{text: '应用管理',link: baseURI + '/manual/scrm/app/index'},
				{text: '会话存档',link: baseURI + '/manual/scrm/session-archive/index'},
				{text: '智能客服',link: baseURI + '/manual/scrm/smart-cs/index'},
			]

		},
	], '/zh/v1/product': [{
		text: '前言',
		link: baseURI + '/product/start/index',
		items: [
			{text: '写作初衷', link: baseURI + '/product/forward/intention'},
			{text: '背后故事', link: baseURI + '/product/forward/story'},
			{text: '使用声明', link: baseURI + '/product/start/statement'},
		]
	}, {
		text: '战略规划', collapsible: true, collapsed: false,

		items: [{text: '战略概述', link: baseURI + '/product/strategy/overview'}, {
			text: '战略设计', link: baseURI + '/product/strategy/design', collapsible: true, collapsed: true,
			items: [{
				text: '通用分析模型', collapsible: true, collapsed: true,
				link: baseURI + '/product/strategy/design/general',
				items: [{text: 'SWOT分析', link: baseURI + '/product/strategy/design/general/swot'}, {
					text: 'PEST分析', link: baseURI + '/product/strategy/design/general/pest'
				},]
			}, {
				text: '竞争性角度模型', link: baseURI + '/product/strategy/design/competitor',
				collapsible: true, collapsed: true,
				items: [{
					text: '波特五力模型', link: baseURI + '/product/strategy/design/competitor/porter'
				}, {
					text: '波特钻石模型', link: baseURI + '/product/strategy/design/competitor/porter-diamond'
				},]
			}, {
				text: '差异性角度模型',
				link: baseURI + '/product/strategy/design/differentiation',
				collapsible: true,
				collapsed: true,
				items: [{
					text: '蓝海战略', link: baseURI + '/product/strategy/design/differentiation/blue-ocean'
				},]
			}, {text: '破坏性创新模型', link: baseURI + '/product/strategy/design/destructive'},]
		}, {
			text: '目标设定', collapsible: true, collapsed: true,
			link: baseURI + '/product/strategy/target',
			items: [{text: '收获', link: baseURI + '/product/strategy/target/income'}, {
				text: '支出', link: baseURI + '/product/strategy/target/cost'
			}, {text: '风险', link: baseURI + '/product/strategy/target/risk'},]
		}, {text: '机会的评估模型', link: baseURI + '/product/strategy/opportunity'}, {
			text: '战略实施', link: baseURI + '/product/strategy/implement'
		},]
	}, {
		text: '解决方案',
		collapsible: true,
		collapsed: false,
		items: [{text: '方案概述', link: baseURI + '/product/solution/overview'}, {
			text: '梳理涉众', link: baseURI + '/product/solution/stakeholder'
		}, {
			text: '涉众期望', collapsible: true, collapsed: true,
			link: baseURI + '/product/solution/expectation',
			items: [{text: '工作职责简表', link: baseURI + '/product/solution/expectation/list'}, {
				text: '工作职责详情', link: baseURI + '/product/solution/expectation/detail'
			}, {text: '期望调查表', link: baseURI + '/product/solution/expectation/requirement'}, {
				text: '期望的差异', link: baseURI + '/product/solution/expectation/difference'
			},]
		}, {
			text: '产品价值', link: baseURI + '/product/solution/product-value',
			collapsible: true, collapsed: true,
			items: [{
				text: '提升人效', link: baseURI + '/product/solution/product-value/enhance-effect'
			}, {text: '降低成本', link: baseURI + '/product/solution/product-value/reduce-cost'}, {
				text: '改善服务', link: baseURI + '/product/solution/product-value/improve-service'
			}, {text: '减少差错', link: baseURI + '/product/solution/product-value/reduce-error'}, {
				text: '提升业绩', link: baseURI + '/product/solution/product-value/improve-performance'
			},]

		}, {text: '价值方案', link: baseURI + '/product/solution/value-solution'}, {
			text: '方案排期', link: baseURI + '/product/solution/requirement-schedule'
		},]
	}, {
		text: '产品设计',
		collapsible: true,
		collapsed: false,
		items: [{text: '导读', link: baseURI + '/product/design/index'}, {
			text: '产品需求说明-PRD', link: baseURI + '/product/design/prd/index'
		}, {text: '用例文档', link: baseURI + '/product/design/prd/useCase'}, {
			text: '梳理参与者', link: baseURI + '/product/design/prd/stakeholder'
		}, {
			text: '系统功能用例分析',
			collapsible: true,
			collapsed: true,
			link: baseURI + '/product/design/prd/system/index',
			items: [{text: '系统初始化安装', link: baseURI + '/product/design/prd/system/install'}, {
				text: '用户管理',
				link: baseURI + '/product/design/prd/system/user',
				collapsible: true,
				collapsed: true,
				items: [{
					text: '创建用户', link: baseURI + '/product/design/prd/system/user/create'
				}, {text: '查看用户列表', link: baseURI + '/product/design/prd/system/user/list'}, {
					text: '查看用户详情', link: baseURI + '/product/design/prd/system/user/detail'
				}, {text: '编辑用户', link: baseURI + '/product/design/prd/system/user/edit'}, {
					text: '删除用户', link: baseURI + '/product/design/prd/system/user/delete'
				}, {
					text: '批量分配用户的部门',
					link: baseURI + '/product/design/prd/system/user/assignUsersToDepartment'
				}, {text: '用户登录', link: baseURI + '/product/design/prd/system/user/login'}, {
					text: '重新设置密码', link: baseURI + '/product/design/prd/system/user/resetPass'
				}, {
					text: '重新发送激活用户', link: baseURI + '/product/design/prd/system/user/resendActivateUserEmail'
				}, {
					text: '启动/禁用用户', link: baseURI + '/product/design/prd/system/user/enableUser'
				}, {
					text: '强制退出', link: baseURI + '/product/design/prd/system/user/forceLogout'
				},]
			}, {
				text: '角色管理',
				link: baseURI + '/product/design/prd/system/role',
				collapsible: true,
				collapsed: true,
				items: [{
					text: '创建角色', link: baseURI + '/product/design/prd/system/role/create'
				}, {text: '查看角色列表', link: baseURI + '/product/design/prd/system/role/list'}, {
					text: '编辑角色', link: baseURI + '/product/design/prd/system/role/edit'
				}, {text: '删除角色', link: baseURI + '/product/design/prd/system/role/delete'}, {
					text: '设置角色权限',
					link: baseURI + '/product/design/prd/system/role/setPermissions',
					collapsible: true,
					collapsed: false,
					items: [{
						text: '设置角色菜单权限', link: baseURI + '/product/design/prd/system/role/setMenuPermissions'
					}, {
						text: '设置角色API权限', link: baseURI + '/product/design/prd/system/role/setAPIPermissions'
					},]
				}, {
					text: '批量分配用户角色', link: baseURI + '/product/design/prd/system/role/assignRoleToUsers'
				},

				]
			}, {
				text: '组织架构',
				link: baseURI + '/product/design/prd/system/organization/index',
				collapsible: true,
				collapsed: false,
				items: [{
					text: '部门管理',
					link: baseURI + '/product/design/prd/system/organization/department',
					collapsible: true,
					collapsed: true,
					items: [{
						text: '创建部门', link: baseURI + '/product/design/prd/system/organization/department/create'
					}, {
						text: '查看部门列表', link: baseURI + '/product/design/prd/system/organization/department/list'
					}, {
						text: '查看部门详情',
						link: baseURI + '/product/design/prd/system/organization/department/detail'
					}, {
						text: '编辑部门', link: baseURI + '/product/design/prd/system/organization/department/edit'
					}, {
						text: '删除部门', link: baseURI + '/product/design/prd/system/organization/department/delete'
					}, // {
						//     text: '部门分配员工',
						//     link: baseURI + '/product/design/prd/system/organization/department/assignUsers'
						// },
					]
				}, // {
					//     text: '职位管理', link: baseURI + '/product/design/prd/system/organization/position',
					//     collapsible: true,
					//     collapsed: true,
					//     items: [
					//         {
					//             text: '创建职位',
					//             link: baseURI + '/product/design/prd/system/organization/position/create'
					//         },
					//         {
					//             text: '查看职位列表',
					//             link: baseURI + '/product/design/prd/system/organization/position/list'
					//         },
					//         {
					//             text: '查看职位详情',
					//             link: baseURI + '/product/design/prd/system/organization/position/detail'
					//         },
					//         {
					//             text: '编辑职位',
					//             link: baseURI + '/product/design/prd/system/organization/position/edit'
					//         },
					//         {
					//             text: '删除职位',
					//             link: baseURI + '/product/design/prd/system/organization/position/delete'
					//         },
					//         {
					//             text: '职位分配员工',
					//             link: baseURI + '/product/design/prd/system/organization/position/assignUsers'
					//         },
					//     ]
					// },
					// {
					//     text: '职称管理', link: baseURI + '/product/design/prd/system/organization/title',
					//     collapsible: true,
					//     collapsed: true,
					//     items: [
					//         {
					//             text: '创建职称',
					//             link: baseURI + '/product/design/prd/system/organization/title/create'
					//         },
					//         {
					//             text: '查看职称列表',
					//             link: baseURI + '/product/design/prd/system/organization/title/list'
					//         },
					//         {
					//             text: '编辑职称',
					//             link: baseURI + '/product/design/prd/system/organization/title/edit'
					//         },
					//         {
					//             text: '删除职称',
					//             link: baseURI + '/product/design/prd/system/organization/title/delete'
					//         },
					//     ]
					// },

				]
			}, // {text: '菜单管理', link: baseURI + '/product/design/prd/system/menu'},
				{
					text: '字典管理', items: [
						{text: '字典列表', link: baseURI + '/product/design/prd/system/dictionary/list'},
						{text: '创建字典', link: baseURI + '/product/design/prd/system/dictionary/create'}
					]
				},
				// {text: 'API管理', link: baseURI + '/product/design/prd/system/api'},
				// {text: '日志管理', link: baseURI + '/product/design/prd/system/log'},
			]
		}, {
			text: '业务功能模块',
			link: baseURI + '/product/design/prd/crm/index',
			collapsible: true,
			collapsed: false,
			items: [
				{
					text: 'CRM',
					collapsible: true,
					collapsed: false,
					items: [{
						text: '客域管理',
						link: baseURI + '/product/design/prd/crm/customer',
						collapsible: true,
						collapsed: true,
						items: [{
							text: '公域线索池',
							link: baseURI + '/product/design/prd/crm/customer/lead/index',
							collapsible: true,
							collapsed: false,
							items: [{
								text: '创建线索', // link: baseURI + '/product/design/prd/crm/customer/lead/create',
								collapsible: true, collapsed: false, items: [{
									text: '授权登录自建线索',
									link: baseURI + '/product/design/prd/crm/customer/lead/create/createdByLogin'
								},]
							}, {
								text: '查看线索列表', link: baseURI + '/product/design/prd/crm/customer/lead/list'
							}, // {
								//     text: '查看线索详情',
								//     link: baseURI + '/product/design/prd/crm/customer/lead/detail'
								// },
								// {
								//     text: '编辑线索',
								//     link: baseURI + '/product/design/prd/crm/customer/lead/edit'
								// },
								// {
								//     text: '删除线索',
								//     link: baseURI + '/product/design/prd/crm/customer/lead/delete'
								// },
								// {
								//     text: '线索分配员工',
								//     link: baseURI + '/product/design/prd/crm/customer/lead/assignUsers'
								// },
							]
						}, {
							text: '客户管理', collapsible: true, collapsed: false, items: [// {
								//     text: '创建客户',
								//     link: baseURI + '/product/design/prd/crm/customer/create'
								// },
								{
									text: '查看客户列表', link: baseURI + '/product/design/prd/crm/customer/list'
								}, // {
								//     text: '查看客户详情',
								//     link: baseURI + '/product/design/prd/crm/customer/detail'
								// },
								// {
								//     text: '编辑客户',
								//     link: baseURI + '/product/design/prd/crm/customer/edit'
								// },
								// {
								//     text: '删除客户',
								//     link: baseURI + '/product/design/prd/crm/customer/delete'
								// },
								// {
								//     text: '客户分配员工',
								//     link: baseURI + '/product/design/prd/crm/customer/assignUsers'
								// },
							]
						},]
					}, {
						text: '产品服务',
						link: baseURI + '/product/design/prd/crm/product',
						collapsible: true,
						collapsed: true,
						items: [{
							text: '商品管理',
							collapsible: true,
							collapsed: false,
							items: [
								{
									text: '商品列表', link: baseURI + '/product/design/prd/crm/product/list'
								},
								{
									text: '新增商品', link: baseURI + '/product/design/prd/crm/product/create'
								},
								{
									text: '编辑商品', link: baseURI + '/product/design/prd/crm/product/edit'
								},
								{
									text: '删除商品', link: baseURI + '/product/design/prd/crm/product/delete'
								},
							]
						}, {
							text: '商品品类',
							collapsible: true,
							collapsed: false,
							items: [
								{
									text: '所有品类', link: baseURI + '/product/design/prd/crm/product/category/list'
								},
								{
									text: '新增品类', link: baseURI + '/product/design/prd/crm/product/category/create'
								},
								{
									text: '编辑品类', link: baseURI + '/product/design/prd/crm/product/category/edit'
								},
								{
									text: '删除品类', link: baseURI + '/product/design/prd/crm/product/category/delete'
								}

							]
						}, {
							text: '价格手册',
							collapsible: true,
							collapsed: false,
							items: [
								{
									text: '价格手册列表', link: baseURI + '/product/design/prd/crm/marketing/mgm/list'
								},
								{
									text: '删除价格手册', link: baseURI + '/product/design/prd/crm/marketing/mgm/list'
								}
								//     {
								//     text: '价格手册实体', link: baseURI + '/product/design/prd/crm/marketing/mgm/list'
								// }, {
								//     text: '价格手册配置表', link: baseURI + '/product/design/prd/crm/marketing/mgm/list'
								// }
							]
						}, {
							text: '元匠管理',
							collapsible: true,
							collapsed: false,
							items: [
								{
									text: '元匠列表', link: baseURI + '/product/design/prd/crm/product/artisan/list'
								},
								{
									text: '新增元匠', link: baseURI + '/product/design/prd/crm/product/artisan/create'
								},
								// {
								//     text: '编辑商品', link: baseURI + '/product/design/prd/crm/product/edit'
								// },
								// {
								//     text: '删除商品', link: baseURI + '/product/design/prd/crm/product/delete'
								// },
							]
						}]
					}, {
						text: '营销管理',
						link: baseURI + '/product/design/prd/crm/marketing',
						collapsible: true,
						collapsed: true,
						items: [{
							text: '门店管理',
							collapsible: true,
							collapsed: false,
							items: [
								{
									text: '门店列表', link: baseURI + '/product/design/prd/crm/marketing/store/list'
								},
								{
									text: '新增商品', link: baseURI + '/product/design/prd/crm/marketing/store/create'
								},
								{
									text: '编辑商品', link: baseURI + '/product/design/prd/crm/marketing/store/edit'
								},
								{
									text: '删除商品', link: baseURI + '/product/design/prd/crm/marketing/store/delete'
								},
							]
						}, {
							text: 'MGM客户裂变', collapsible: true, collapsed: false, items: [{
								text: '客户裂变树', link: baseURI + '/product/design/prd/crm/marketing/mgm/list'
							},]
						}, {
							text: '媒体管理',
							link: baseURI + '/product/design/prd/crm/marketing/media',
							collapsible: true,
							collapsed: false,
							items: [{
								text: '新增媒体', link: baseURI + '/product/design/prd/crm/marketing/media/create'
							}, {
								text: '列表媒体', link: baseURI + '/product/design/prd/crm/marketing/media/list'
							}, {
								text: '编辑媒体', link: baseURI + '/product/design/prd/crm/marketing/media/edit'
							}, {
								text: '删除媒体', link: baseURI + '/product/design/prd/crm/marketing/media/delete'
							},]
						}, {
							text: '品牌故事',
							link: baseURI + '/product/design/prd/crm/marketing/brand',
							collapsible: true,
							collapsed: false,
							items: [{
								text: '编辑品牌故事', link: baseURI + '/product/design/prd/crm/marketing/brand/edit'
							},]
						},]
					}, {
						text: '商务管理',
						link: baseURI + '/product/design/prd/crm/business',
						collapsible: true,
						collapsed: true,
						items: [{
							text: '商机管理',
							link: baseURI + '/product/design/prd/crm/business/opportunity',
							collapsible: true,
							collapsed: false,
							items: [{
								text: '商机列表', link: baseURI + '/product/design/prd/crm/business/opportunity/list'
							}, {
								text: '创建商机', // link: baseURI + '/product/design/prd/crm/business/opportunity/create',
								collapsible: true, collapsed: false, items: [{
									text: '客户主动咨询',
									link: baseURI + '/product/design/prd/crm/business/opportunity/create/createdByCustomer'
								},]
							},]
						}, {
							text: '报价管理',
							link: baseURI + '/product/design/prd/crm/business/quote',
							collapsible: true,
							collapsed: true,
							items: [{
								text: '报价列表', link: baseURI + '/product/design/prd/crm/business/quote/list'
							}, {
								text: '创建报价', // link: baseURI + '/product/design/prd/crm/business/quote/create',
								collapsible: true, collapsed: false, items: [{
									text: '客户主动咨询',
									link: baseURI + '/product/design/prd/crm/business/quote/create/createdByCustomer'
								},]
							},]
						}, {
							text: '合同管理',
							link: baseURI + '/product/design/prd/crm/business/contract',
							collapsible: true,
							collapsed: true,
							items: [{
								text: '报价列表', link: baseURI + '/product/design/prd/crm/business/contract/list'
							}, {
								text: '创建报价', // link: baseURI + '/product/design/prd/crm/business/contract/create',
								collapsible: true, collapsed: false, items: [{
									text: '客户主动咨询',
									link: baseURI + '/product/design/prd/crm/business/contract/create/createdByCustomer'
								},]
							},]
						}]
					}, {
						text: '交易管理',
						link: baseURI + '/product/design/prd/crm/trade',
						collapsible: true,
						collapsed: true,
						items: [{
							text: '订单管理',
							link: baseURI + '/product/design/prd/crm/trade/order',
							collapsible: true,
							collapsed: false,
							items: [{
								text: '订单列表', link: baseURI + '/product/design/prd/crm/trade/order/list'
							}, {
								text: '导入订单', link: baseURI + '/product/design/prd/crm/trade/order/import'
							},]
						}, {
							text: '支付单管理',
							link: baseURI + '/product/design/prd/crm/trade/payment',
							collapsible: true,
							collapsed: true,
							items: [{
								text: '支付单列表', link: baseURI + '/product/design/prd/crm/trade/payment/list'
							}, {
								text: '导入订单', link: baseURI + '/product/design/prd/crm/trade/payment/import'
							},]
						},]
					},
						{
							text: '会籍管理', link: baseURI + '/product/design/prd/crm/membership',
							collapsible: true,
							collapsed: true,
							items: [{
								text: '会籍列表', link: baseURI + '/product/design/prd/crm/membership/list'
							}, {
								text: '代币', link: baseURI + '/product/design/prd/crm/membership/token/index'
							}, {
								text: '积分管理', link: baseURI + '/product/design/prd/crm/membership/score/index'
							}]
						},
					]
				},
				{
					text: 'SCRM', link: baseURI + '/product/design/prd/scrm/index',
					collapsible: true,
					collapsed: false,
					items: [
						{
							text: '营销获客', link: baseURI + '/product/design/prd/scrm/marketingAcquisition/index',
							collapsible: true,
							collapsed: true,
							items: [
								{
									text: '群活码', link: baseURI + '/product/design/prd/scrm/marketingAcquisition/group/index',
								},
								{
									text: '渠道活码', link: baseURI + '/product/design/prd/scrm/marketingAcquisition/contactWay/index',
								}
							]
						},
						{
							text: 'CMS',
							collapsible: true,
							collapsed: true,
							items: [
								{
									text: '媒体库（企业微信）', link: baseURI + '/product/design/prd/scrm/cms/media/index',
								},
								{
									text: '话术库', link: baseURI + '/product/design/prd/scrm/cms/scriptLib/index',
								}
							]
						},
						{
							text: '客户运营',
							collapsible: true,
							collapsed: true,
							items: [
								{
									text: '客户群发', link: baseURI + '/product/design/prd/scrm/customerOperation/groupSend/index',
								},
								{
									text: '入群欢迎语', link: baseURI + '/product/design/prd/scrm/customerOperation/welcomeScript/index',
								},
								{
									text: '企微朋友圈', link: baseURI + '/product/design/prd/scrm/customerOperation/moment/index',
								},
								{
									text: '员工群发记录',
									link: baseURI + '/product/design/prd/scrm/customerOperation/employeeGroupSendHistory/index',
								}
							]
						},
						{
							text: '客域管理',
							collapsible: true,
							collapsed: true,
							items: [
								{
									text: '客户管理', link: baseURI + '/product/design/prd/scrm/customerManagement/externalUser/index',
								},
								{
									text: '渠道活码', link: baseURI + '/product/design/prd/scrm/customerManagement/contractWay/index',
								},
								{
									text: '客户迁移', link: baseURI + '/product/design/prd/scrm/customerManagement/customerMigrate/index',
								},
								{
									text: '黑名单', link: baseURI + '/product/design/prd/scrm/customerManagement/blackList/index',
								}
							]
						},
						{
							text: '客户群管理',
							collapsible: true,
							collapsed: true,
							items: [
								{
									text: '客户群列表', link: baseURI + '/product/design/prd/scrm/customerGroup/groupList/index',
								},
								{
									text: '客户群标签', link: baseURI + '/product/design/prd/scrm/customerGroup/groupTag/index',
								}
							]
						},
						{
							text: '会话业务',
							collapsible: true,
							collapsed: true,
							items: [
								{
									text: '同步会话记录', link: baseURI + '/product/design/prd/scrm/session/sync/index',
								},
								{
									text: '对话质检', link: baseURI + '/product/design/prd/scrm/session/qa/index',
								},
								{
									text: '总结会话纪要(插件形式)', link: baseURI + '/product/design/prd/scrm/session/aiSummary/index',
								}
							]
						},
						{
							text: '智能客服',
							collapsible: true,
							collapsed: true,
							items: [
								{
									text: 'Case反馈', link: baseURI + '/product/design/prd/scrm/chatBot/case/index',
								},
								{
									text: '在线人工客服(插件形式)', link: baseURI + '/product/design/prd/scrm/chatBot/online/index',
								},
								{
									text: '问答智能客服(插件形式)', link: baseURI + '/product/design/prd/scrm/chatBot/chatbot/index',
								}
							]
						},
						{
							text: '组织架构管理',
							collapsible: true,
							collapsed: true,
							items: [
								{
									text: '部门管理', link: baseURI + '/product/design/prd/scrm/organization/department/index',
								},
								{
									text: '员工管理', link: baseURI + '/product/design/prd/scrm/organization/employee/index',
								},
								{
									text: '组织架构同步', link: baseURI + '/product/design/prd/scrm/organization/sync/index',
								},
								{
									text: '定制化权限', link: baseURI + '/product/design/prd/scrm/organization/permission/index',
								},
								{
									text: '组织架构变更管理', link: baseURI + '/product/design/prd/scrm/organization/change/index',
								}
							]
						}
					]
				}
			]
		}, {
			text: '系统架构描述',
			link: baseURI + '/product/design/prd/infoStructure',
			collapsible: true,
			collapsed: true,
			items: [{text: '系统', link: baseURI + '/product/design/prd/infoStructure/system'}, {
				text: '客域',
				link: baseURI + '/product/design/prd/infoStructure/customer'
			}, {
				text: '系统与微信关系',
				link: baseURI + '/product/design/prd/infoStructure/eeToCust'
			}, {text: '市场', link: baseURI + '/product/design/prd/infoStructure/marketing'},
				{text: '产品服务', link: baseURI + '/product/design/prd/infoStructure/product'},
				{
					text: '商务',
					link: baseURI + '/product/design/prd/infoStructure/business'
				}, {text: '交易', link: baseURI + '/product/design/prd/infoStructure/trade'}, {
					text: '用例类图', collapsible: true, collapsed: false, items: [{
						text: '授权登录自建线索',
						link: baseURI + '/product/design/prd/infoStructure/useCase/leadCreatedByLogin'
					}, {
						text: '客户主动咨询',
						link: baseURI + '/product/design/prd/infoStructure/useCase/oppCreatedByCustomer'
					}, {text: 'MGM客户裂变', link: baseURI + '/product/design/prd/infoStructure/useCase/mgm'},]
				},]
		},]
	},
		{
			text: '产品管理', collapsible: true, items: [
				{
					text: '需求管理',
					collapsible: true,
					collapsed: false,
					items: [
						{text: '需求排期模型', link: baseURI + '/product/manage/requirement/index'},
						{text: '需求池', link: baseURI + '/product/manage/requirement/pool'}
					]
				},
				// {
				//     text: '目标管理', link: baseURI + '/product/scrm/user'
				// },
			]
		}
	]
}

const {BASE: base = '/'} = process.env

export default {
	base, outDir: '',
	themeConfig: {
		logo: "/images/logo-small.png", siteTitle: "PowerX",

		nav: nav, sidebar: sidebar,

		algolia: {
			indexName: 'powerx', appId: 'WWQJSAUFP5', apiKey: '970f2d4ae17f79ae0d27d842c330474f', searchParameters: {
				facetFilters: ['lang:manual-CN']
			}
		},

		socialLinks: [// { icon: 'languages', link: '/translations/' },
			{icon: 'github', link: 'https://github.com/ArtisanCloud/PowerX'}], editLink: {
			repo: 'ArtisanCloud/PowerXDocs#master', text: 'Edit this page on GitHub'
		},

		footer: {
			message: 'Released under the Apache-2.0 license',
			copyright: `Copyright © 2021-${new Date().getFullYear()} ArtisanCloud`
		}
	}, title: 'PowerXDoc', description: 'PowerX Documentation',


}