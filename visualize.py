from matplotlib import pyplot as plt
import numpy as np
def getCoords(filename):
    with open(filename, 'r') as file:
        xs,ys = [],[]
        data = file.read().replace('\n', '').replace(' ','').split('[')
        for x in data:
            curr =  x.split(',')
            curr = [y.replace(']','').replace('[','') for y in curr]
            curr = [y for y in curr if y]
            if curr:
                print(curr)
                xs.append(float(curr[0]))
                ys.append(float(curr[1]))
    return xs,ys

x,y = getCoords('output.txt')
# x1,y1 = getCoords('out1.txt')
# plt.plot(x,y,label = 'max degree')
m,b = np.polyfit(x,y,1)
print(f'm={m},b={b}')
# plt.plot(x1,y1,label = 'average degree')


plt.show()
plt.close()
        
    