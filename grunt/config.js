/**
 * Created by john on 15/5/22.
 */


//如果是版本迭代，累加中间数字，累加1，把最后一个数字修改为0

//如果是BUG修复，更新版本，则修改最后一个数字，累加1

//如果是打包提交给测试，则版本要和线上版本保持一直，防止触发自动更新

module.exports={
        name:"明道",
        url:"https://www.mingdao.com",
        "node-remote":".mingdao.com",
        version:"1.0.0"
    };
