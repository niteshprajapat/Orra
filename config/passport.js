import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from "../models/user.model.js";


dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5000/api/v1/auth/google/callback",
            scope: ["profile", "email"],
        },

        async (accessToken, refreshToken, profile, done) => {
            try {

                console.log("profile", profile);

                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        fullname: profile.displayName,
                        username: profile.emails[0].value.split("@")[0], // Create username from email
                        email: profile.emails[0].value,
                        profilePicture: { url: profile.photos[0]?.value || "" },
                        isVerified: true,
                    });

                    await user.save();
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }

    )
);



passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});