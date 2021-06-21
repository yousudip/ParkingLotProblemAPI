USE [test_db]
GO
/****** Object:  Table [dbo].[alotment]    Script Date: 21-06-2021 16:14:17 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[alotment](
	[id] [int] IDENTITY(10,1) NOT NULL,
	[ps_id] [int] NULL,
	[vahicle_number] [varchar](10) NULL,
	[vahicle_type] [varchar](4) NULL,
	[alotted_time] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[parking_spaces]    Script Date: 21-06-2021 16:14:17 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[parking_spaces](
	[id] [int] IDENTITY(10,1) NOT NULL,
	[floor_no] [int] NULL,
	[p_type] [varchar](4) NULL,
	[rate] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[alotment] ADD  DEFAULT (getdate()) FOR [alotted_time]
GO
