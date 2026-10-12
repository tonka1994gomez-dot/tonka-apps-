from pathlib import Path
p=Path('android/app/src/main/AndroidManifest.xml')
s=p.read_text()
if 'android.permission.CAMERA' not in s:
    s=s.replace('<application','<uses-permission android:name="android.permission.CAMERA"/><uses-feature android:name="android.hardware.camera" android:required="false"/><application',1)
p.write_text(s)
