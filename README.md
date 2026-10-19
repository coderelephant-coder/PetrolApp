npx expo start --clear
eas build -p android --profile production
eas build -p android --profile development
eas build -p android --profile preview
eas update --channel preview --platform android --message "adjust user menu"

git add petrolApp
git commit -a -m "add contact support component"
git push petapp main
git push origin main

npx prisma db push

git remote add adeyemi https://github.com/adeyemithecoder/petapp.git

git remote add petapp main https://github.com/petapp4all/petapp

petapp4all/petapp

git config --global user.name "adeyemithecoder"
git config --global user.email "mathewadeyemi7654@gmail.com"
