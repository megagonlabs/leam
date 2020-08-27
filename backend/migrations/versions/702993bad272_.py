"""empty message
Revision ID: 702993bad272
Revises: 31ea4e94df36
Create Date: 2020-06-24 21:43:54.764945
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "702993bad272"
down_revision = "14af542435b2"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("dataset", sa.Column("table_name", sa.String(), nullable=True))
    op.drop_column("dataset", "version")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "dataset",
        sa.Column("version", sa.INTEGER(), autoincrement=False, nullable=True),
    )
    op.drop_column("dataset", "table_name")
    # ### end Alembic commands ###