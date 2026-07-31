from sqlalchemy.ext.asyncio import AsyncSession
from app.models.sql_models import ComplainManagement
from app.schemas import OnlyComplain, OnlyRiskData
from datetime import datetime
from sqlalchemy import select, or_, and_



class SaveComplainData:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def save_complain_data(self, complain_data: OnlyComplain, risk_analysis: OnlyRiskData):

        data = ComplainManagement(complaint_data=complain_data.model_dump(), defect_analysis=risk_analysis.model_dump())
        self.session.add(data)
        await self.session.commit()
        
        return complain_data


    async def show_complain_data(self, limit: int, cursor: datetime | None, cursor_id: int | None):
            
            stmt = select(ComplainManagement)

          
            if cursor and cursor_id:
                
                cursor_naive = cursor.replace(tzinfo=None) if cursor.tzinfo else cursor
                
                stmt = stmt.where(
                    or_(
                        ComplainManagement.created_at < cursor_naive,
                        and_(
                            ComplainManagement.created_at == cursor_naive,
                            ComplainManagement.id < cursor_id,
                        ),
                    )
                )

            
            stmt = stmt.order_by(
                ComplainManagement.created_at.desc(), 
                ComplainManagement.id.desc()
            ).limit(limit + 1)

            result = await self.session.execute(stmt)
            tasks = result.scalars().all()

            has_next = len(tasks) > limit
            items = tasks[:limit]

            next_cursor = None
            if has_next and items:
                last_item = items[-1]
                next_cursor = {
                    "cursor": last_item.created_at.isoformat() if last_item.created_at else None,
                    "cursor_id": last_item.id
                }

            return {
                "items": items,
                "has_next": has_next,
                "next_cursor": next_cursor
            }


    async def delete_complain_data(self, complain_id: int):
        stmt = select(ComplainManagement).where(ComplainManagement.id == complain_id)
        result = await self.session.execute(stmt)
        complain = result.scalars().one_or_none()
        if complain:
            await self.session.delete(complain)
            await self.session.commit()
            return True
        return False