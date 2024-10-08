const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const User=require('../models/user');
const Group=require('../models/group');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        // console.log(user);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid password",
            });
        }

        const token = jwt.sign({ _id: user._id }, "pqowieuryt", { expiresIn: '1h' });

        res.cookie("token", token, {
            httpOnly: true, // Prevent client-side JS access
            secure: process.env.NODE_ENV === 'production', // Secure cookies in production
            sameSite: 'Lax' // Prevent CSRF attacks
        }).json({
            success: true,
            message: "Login successful",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error during login",
        });
    }
};

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // Generate JWT Token
        const token = jwt.sign({ _id: user._id }, "pqowieuryt", { expiresIn: '1h' });

        // Set token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'Lax',
            maxAge: 3600000 // 1 hour
        }).json({
            success: true,
            message: "Register successful",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error during registration",
        });
    }
};


const showGrp = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('groups.groupId');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.json({
            success: true,
            groups: user.groups
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'group Fetching failed'
        });
    }
}

const createGrp=async(req,res)=>
{
    try 
    {
        const {name,description,code}=req.body;
        group=await Group.create({
            name,
            description,
            code
        });
        group.members.push({
            userId:req.user._id,
            name:req.user.name,
            email:req.user.email
        });
        group.balances.push({
            userId:req.user._id,
            balancesWithOthers:[]
        });
        group.save();
        const user=await User.findOne({_id:req.user._id});
        user.groups.push({
            groupId:group._id,
            groupName:group.name
        });
        user.save();
        res.json({
            success:true,
            message:"Group created"
        })
    }
    catch (error) 
    {
        res.status(404).json({
            success:false,
            message:"Group creation failed"
        })
    }
}
const joinGrp=async(req,res)=>
{
    try
    {
        const {code}=req.body;
        const group=await Group.findOne({code});
        if(!group)
        {
            return res.status(404).json({
                success:false,
                message:"Group not found"
            })
        }
        group.members.push({
            userId:req.user._id,
            name:req.user.name,
            email:req.user.email
        });
        group.balances.push({
            userId:req.user._id,
            balancesWithOthers:[]
        });
        for(let i=0;i<group.members.length;i++)
        {
            if(group.members[i].userId.toString()!==req.user._id.toString())
            {
                group.balances[group.balances.length-1].balancesWithOthers.push({
                    otherUserId:group.members[i].userId,
                    amountLent:0,
                    amountOwed:0
                })
            }
        }
        for(let i=0;i<group.balances.length;i++)
        {
            if(group.balances[i].userId.toString()!==req.user._id.toString())
            {
                group.balances[i].balancesWithOthers.push({
                    otherUserId:req.user._id,
                    amountLent:0,
                    amountOwed:0
                })
            }
        }

        group.save();
        const user=await User.findOne({_id:req.user._id});
        user.groups.push({
            groupId:group._id,
            groupName:group.name
        });
        user.save();
        res.json({
            success:true,
            message:"Group joined"
        })
    }
    catch (error) {
        res.status(404).json({
            success:false,
            message:"Server error"
        })
    }
} 
const addTransaction = async (req, res) => {
    try {
        const { amount, description, groupId, splitAmong, date } = req.body;
        const activeUser = await User.findOne({ _id: req.user._id });
        const activeGroup = await Group.findById(groupId);
        if (!activeGroup || !activeUser) {
            return res.status(404).json({ success: false, message: "Group or User not found" });
        }

        const size = splitAmong.length;
        const each = amount / size;
        const userGroup = activeUser.groups.find(group => group.groupId.toString() === groupId.toString());
        if (userGroup) {
            userGroup.amountLent += amount;
        }
        const record = activeGroup.balances.find(balance => balance.userId.toString() === req.user._id.toString());
        if(!record)
        {
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
        
        for (let i = 0; i <size; i++) {
            const otherUserId = splitAmong[i];
            const balanceWithOther = record.balancesWithOthers.find(b => b.otherUserId.toString() === otherUserId.toString());
            if (balanceWithOther) {
                balanceWithOther.amountLent += each;
            }
            const otherUser = await User.findById(otherUserId);
            const otherUserGroup = otherUser.groups.find(group => group.groupId.toString() === groupId.toString());
            if (otherUserGroup) {
                otherUserGroup.amountOwed += each;
                await otherUser.save();
            }
            await activeGroup.save();
        }

       
        for (let i = 0; i < size; i++)
        {
            const otherUserId = splitAmong[i];
            const otherUserBalance = activeGroup.balances.find(balance => balance.userId.toString() === otherUserId.toString());
            if (otherUserBalance) {
                const reverseBalanceWithUser = otherUserBalance.balancesWithOthers.find(b => b.otherUserId.toString() === req.user._id.toString());
                if (reverseBalanceWithUser) {
                    reverseBalanceWithUser.amountOwed += each;
                }
            }
            await activeGroup.save();
        }

        console.log(typeof Number(amount));

        activeGroup.expenses.push({
            description,
            amount: Number(amount), 
            paidBy: req.user._id,
            // splitAmong,
        });

        console.log("reached here");
        await activeUser.save();
        await activeGroup.save();

        res.json({
            success: true,
            message: "Expense added"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Expense adding failed"
        });
    }
};
const settle=async(req,res)=>
{
    try
    {
        const {groupId,amount,toSettleId}=req.body;
        
        const activeUser = await User.findOne({ _id: req.user._id });
        const activeGroup = await Group.findById(groupId);

        if (!activeGroup || !activeUser) {
            return res.status(404).json({ success: false, message: "Group or User not found" });
        }

        const record=  activeGroup.balances.find(balance=>balance.userId.toString()===req.user._id.toString());
        record.balancesWithOthers.find(b=>b.otherUserId.toString()===toSettleId.toString()).amountOwed-=amount;
        const otherUserBalance= activeGroup.balances.find(balance=>balance.userId.toString()===toSettleId.toString());
        otherUserBalance.balancesWithOthers.find(b=>b.otherUserId.toString()===req.user._id).amountLent-=amount;

        activeUser.groups.find(group=>group.groupId.toString()===groupId.toString()).amountOwed-=amount;
        const otherUser=await User.findById(toSettleId);
        otherUser.groups.find(group=>group.groupId.toString()===groupId.toString()).amountLent-=amount;

        await activeUser.save();
        await otherUser.save();
        await activeGroup.save();
        res.json({
            success:true,
            message:"Settled"
        })
    }
    catch
    {
        res.status(404).json({
            success:false,
            message:"Server error"
        })
    }
}
const showHistory=async(req,res)=>
{
    try
    {
        const {groupId}=req.body;
        const group=await Group.findById(groupId);
        if(!group)
        {
            return res.status(404).json({
                success:false,
                message:"Group not found"
            })
        }
        res.json({
            success:true,
            expenses:group.expenses
        })
    }
    catch (error) {
        res.status(404).json({
            success:false,
            message:"history fetching failed"
        })
    }
}
const logout=async(req,res)=>
{
    try
    {
        res.clearCookie("token").json({
            success:true,
            message:"Logged out"
        })

    }
    catch (error) {
        res.status(404).json({
            success:false,
            message:"Server error"
        })
    }
}
module.exports = { 
            login, 
            register,
            showGrp,
            joinGrp,
            createGrp,
            addTransaction,
            settle,
            showHistory,
            logout
        };