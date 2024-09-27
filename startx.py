import subprocess
print("Start X")
startx = subprocess.Popen(["startx", "--", "-nocursor"], stdout=subprocess.PIPE)
print("X Server started")
