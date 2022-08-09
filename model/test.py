from collections import UserString
import sys
import shutil

# 该文件为Simple中需要上传的Script文件模板
# 文件输出后一定要写print打印输出，以便于后端接受，并且print要设置end=""

def ouputImage(userID, appID):
    appPath = 'public/users/'+userID+'/'+appID
    shutil.copyfile(appPath+'/input/Kaze.png', appPath+'/output/Kaze.png')


    
    print(appPath+'/output/Kaze.png', end="")


if __name__ == '__main__':
    ouputImage(sys.argv[1], sys.argv[2])  # 这里是设置传入参数,由node.js的child_process调用并传入参数
