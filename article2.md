Not long ago, I decided to install Linux on my PC and dual boot it alongside Windows. My motivation was simple: I work with Red Hat Enterprise Linux servers nearly every day, so running Linux at home felt like the perfect way to sharpen my skills outside of work.

Following the usual recommendation, I went with Linux Mint. It is often considered the “baby’s introduction to Linux” thanks to its slower release cycle, which means better stability, and its Cinnamon desktop, which looks and feels familiar to Windows users. The idea is that things “just work,” so you don’t feel like a stranger in a strange land.

Back then, I used to think anyone running Linux was some sort of techno-wizard. Honestly, Linux users don’t always help their own image. There is often this smug air of superiority when they look down on Windows or Mac users, which understandably rubs people the wrong way. But in reality, Linux isn’t hard to use on the surface. Even gaming on Linux is perfectly viable these days thanks to Proton, Valve’s Windows game compatibility layer.

I once told a coworker I was gaming on Linux, and he looked at me puzzled: “But how do you game without a GUI?” He had no idea that Linux comes in many desktop environments, and that a never-ending holy war rages online about which one is “best.” We all know it is KDE Plasma, by the way, even though I am typing this on GNOME and have no plans to switch back to Plasma anytime soon.

Eventually, I ran into stuttering issues playing Red Dead Redemption 2 on Mint. To get more up-to-date drivers, which are especially helpful for gaming, I decided to switch to Fedora. In the process, I accidentally blew away my Windows partition. I had two SSDs: a Samsung 860 and an 870. "Well clearly I installed Windows first so Windows lives on the older model", I thought to myself. Well, I was dead wrong. But since I had my important files backed up, nothing of value was lost. Honestly, I haven’t looked back at Windows since.

For the most part, my Linux experience has been smooth until I get the urge to tinker. Recently one day I decided to re-enable Secure Boot in my BIOS. I had disabled it earlier to make installing Nvidia drivers easier.

Bad idea.

After saving changes and rebooting, I was greeted with a black screen. Rebooted again: same thing. I figured it must be a graphics driver issue, so I checked my bootloader (GRUB) settings. Sure enough, I had disabled the default open-source driver, Nouveau. That explained the black screen. In my "brilliance" I had essentially left my system without a graphics driver. 

After some GRUB menu editing, I got Nouveau to load and reached my desktop, but the terminal refused to open. A window flashed asking me to enroll the MOK (Machine Owner Key, which is a way to tell Secure Boot to trust custom drivers like Nvidia), but clicking it did nothing.

I tried removing the Nouveau blacklist and rebooted again. Same result: the desktop loaded, but most apps would not open. My guess was that Nvidia and Nouveau were fighting each other under the hood.
At that point, I figured I would just roll back and disable Secure Boot. That should have allowed Nvidia to load again, but it did not. The system was still broken.

So I decided to do things properly: generate my own signing key and use it to sign the Nvidia driver.

```
openssl req -new -x509 -newkey rsa:2048 \
 -keyout ~/secureboot_keys/MOK.priv \
 -outform DER -out ~/secureboot_keys/MOK.der \
 -nodes -days 36500 \
 -subj "/CN=NVIDIA Secure Boot Signing Key/"

```

Then I imported the key so my firmware would trust it:

```
sudo mokutil --import ~/secureboot_keys/MOK.der

```

After rebooting and enrolling the key through the MOK manager, I signed the Nvidia kernel module:

```
sudo /usr/sbin/akmods --force --kmod nvidia

```

Finally, success. I was back on my desktop, with everything working, and Secure Boot enabled.

Which brings me to the obvious question: Why do I keep fixing things that aren’t broken?

The answer is simple. I love fixing things that are broken and learning something new in the process. 

But at the end of the day, if someone doesn't enjoy troubleshooting and want things to "just work", I totally understand someone preferring Windows or MacOS and think it is really silly to look down on those who do. Some Linux users don't understand telling someone "just go read the documentation and a bunch of techno babble you've never experienced before" isn't going to land well. You have to enjoy doing so in the first place. And I enjoy it for some reason even at the cost of my sanity. 