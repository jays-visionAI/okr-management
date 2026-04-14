// PostgreSQL Database Schema for OKR Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    role VARCHAR(50) DEFAULT 'member', -- 'admin', 'manager', 'member'
    avatar_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Team members junction table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- 'manager', 'member'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Objectives table
CREATE TABLE objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id),
    team_id UUID REFERENCES teams(id),
    parent_objective_id UUID REFERENCES objectives(id),
    period VARCHAR(20) NOT NULL, -- 'Q1-2024', 'Q2-2024', etc.
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'draft', 'active', 'completed', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Key Results table
CREATE TABLE key_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    objective_id UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metric_type VARCHAR(50) NOT NULL, -- 'percentage', 'number', 'currency', 'boolean'
    start_value DECIMAL(15, 2) DEFAULT 0,
    target_value DECIMAL(15, 2) NOT NULL,
    current_value DECIMAL(15, 2) DEFAULT 0,
    unit VARCHAR(50), -- '%', '건', '원', etc.
    assignee_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'on_track', -- 'on_track', 'at_risk', 'behind', 'completed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Progress Updates table
CREATE TABLE progress_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_result_id UUID NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    value DECIMAL(15, 2) NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    objective_id UUID REFERENCES objectives(id) ON DELETE CASCADE,
    key_result_id UUID REFERENCES key_results(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES comments(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'progress_update', 'comment', 'mention', 'status_change'
    title VARCHAR(255) NOT NULL,
    message TEXT,
    related_objective_id UUID REFERENCES objectives(id),
    related_key_result_id UUID REFERENCES key_results(id),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_objectives_owner ON objectives(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_objectives_team ON objectives(team_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_objectives_period ON objectives(period);
CREATE INDEX idx_key_results_objective ON key_results(objective_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_key_results_assignee ON key_results(assignee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_progress_updates_kr ON progress_updates(key_result_id);
CREATE INDEX idx_comments_objective ON comments(objective_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_key_result ON comments(key_result_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- Update trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_objectives_updated_at BEFORE UPDATE ON objectives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_key_results_updated_at BEFORE UPDATE ON key_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Soft delete trigger
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    NEW.deleted_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for development
INSERT INTO users (id, email, password_hash, name, department, role) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@blueforce.com', '$2b$10$dummy', '관리자', '경영관리', 'admin'),
    ('22222222-2222-2222-2222-222222222222', 'manager@blueforce.com', '$2b$10$dummy', '팀매니저', '개발팀', 'manager'),
    ('33333333-3333-3333-3333-333333333333', 'member@blueforce.com', '$2b$10$dummy', '개발자', '개발팀', 'member');

INSERT INTO teams (id, name, description, manager_id) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '개발팀', '블루포지 개발팀', '22222222-2222-2222-2222-222222222222');

INSERT INTO team_members (team_id, user_id, role) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'manager'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'member');